import json
from pathlib import Path
from typing import Any
from unittest.mock import MagicMock

import pytest
import requests

from etl.ingest_osm import (
    deduplicate_bars,
    extract_neighborhood_from_address,
    fetch_osm_bars,
    haversine_meters,
    load_legacy_csv,
    main,
    parse_osm_elements,
    slugify,
    upsert_bars,
)


def test_slugify_normalizes_accents_and_punctuation() -> None:
    assert slugify("Alexandre’s Bar") == "alexandres-bar"
    assert slugify("Bar do João (São João Batista)") == "bar-do-joao-sao-joao-batista"


def test_slugify_returns_unnamed_when_empty_or_symbols_only() -> None:
    assert slugify("") == "unnamed"
    assert slugify("!!! ---") == "unnamed"


def test_extract_neighborhood_from_address() -> None:
    assert extract_neighborhood_from_address("Rua Piauí, 1884, Funcionários") == "Funcionários"
    assert extract_neighborhood_from_address("Rua Francisco Deslandes, 222") is None
    assert extract_neighborhood_from_address("") is None


def test_load_legacy_csv_cleans_names_and_deduplicates_ids(tmp_path: Path) -> None:
    csv_file = tmp_path / "butecos_sample.csv"
    csv_file.write_text(
        "\n".join(
            [
                "name;address;latitude;longitude",
                ",Bar da Silvânia;Rua Soares Nogueira, 801, Camargos;-19.9426967;-44.0181413",
                "Baiúca;Rua Piauí, 1884, Funcionários;-19.9358597;-43.9279865",
                "Baiúca;Rua Piauí, 1885, Funcionários;-19.9359000;-43.9280000",
                "Sem Coordenada;Rua X, 10;;",
            ]
        ),
        encoding="utf-8",
    )

    records = load_legacy_csv(csv_file)

    assert len(records) == 3
    assert records[0]["name"] == "Bar da Silvânia"
    assert records[0]["neighborhood"] == "Camargos"
    assert records[0]["external_id"] == "legacy:bar-da-silvania"
    assert records[0]["source"] == "legacy_csv"
    assert records[0]["category"] == "buteco"

    assert records[1]["external_id"] == "legacy:baiuca"
    assert records[2]["external_id"] == "legacy:baiuca-3"


def test_load_legacy_csv_raises_for_missing_file(tmp_path: Path) -> None:
    missing = tmp_path / "nao_existe.csv"
    with pytest.raises(FileNotFoundError):
        load_legacy_csv(missing)


def test_parse_osm_elements_handles_nodes_ways_and_metadata() -> None:
    elements: list[dict[str, Any]] = [
        {
            "type": "node",
            "id": 101,
            "lat": -19.9321,
            "lon": -43.9385,
            "tags": {
                "name": "Bar do Antônio",
                "amenity": "bar",
                "addr:street": "Rua Paraíba",
                "addr:housenumber": "500",
                "addr:suburb": "Savassi",
                "phone": "+55 31 3222-0000",
                "website": "https://exemplo.com",
                "ignored_tag": "nao_entra",
            },
        },
        {
            "type": "way",
            "id": 202,
            "center": {"lat": -19.9205, "lon": -43.9412},
            "tags": {
                "name": "Pub Central",
                "amenity": "pub",
                "addr:neighbourhood": "Centro",
                "outdoor_seating": "yes",
            },
        },
    ]

    records = parse_osm_elements(elements)

    assert len(records) == 2
    assert records[0]["external_id"] == "osm:node/101"
    assert records[0]["address"] == "Rua Paraíba, 500, Savassi"
    assert records[0]["neighborhood"] == "Savassi"
    assert records[0]["metadata"] == {
        "phone": "+55 31 3222-0000",
        "website": "https://exemplo.com",
    }

    assert records[1]["external_id"] == "osm:way/202"
    assert records[1]["category"] == "pub"
    assert records[1]["neighborhood"] == "Centro"
    assert records[1]["latitude"] == -19.9205
    assert records[1]["metadata"] == {"outdoor_seating": "yes"}


def test_parse_osm_elements_skips_nameless_or_coordinate_less_items() -> None:
    elements: list[dict[str, Any]] = [
        {"type": "node", "id": 1, "lat": -19.9, "lon": -43.9, "tags": {}},
        {"type": "node", "id": 2, "lat": -19.9, "lon": -43.9, "tags": {"name": "   "}},
        {"type": "way", "id": 3, "tags": {"name": "Sem Centro"}},
    ]

    assert parse_osm_elements(elements) == []


def test_fetch_osm_bars_returns_parsed_records(monkeypatch: pytest.MonkeyPatch) -> None:
    fake_response = MagicMock()
    fake_response.json.return_value = {
        "elements": [
            {
                "type": "node",
                "id": 77,
                "lat": -19.93,
                "lon": -43.94,
                "tags": {"name": "Boteco Teste", "amenity": "bar"},
            }
        ]
    }
    mock_post = MagicMock(return_value=fake_response)
    monkeypatch.setattr("etl.ingest_osm.requests.post", mock_post)

    records = fetch_osm_bars(timeout=15)

    assert len(records) == 1
    assert records[0]["external_id"] == "osm:node/77"
    mock_post.assert_called_once()
    fake_response.raise_for_status.assert_called_once()


def test_fetch_osm_bars_propagates_http_errors(monkeypatch: pytest.MonkeyPatch) -> None:
    fake_response = MagicMock()
    fake_response.raise_for_status.side_effect = requests.HTTPError("504 Gateway Timeout")
    monkeypatch.setattr("etl.ingest_osm.requests.post", MagicMock(return_value=fake_response))

    with pytest.raises(requests.HTTPError):
        fetch_osm_bars()


def test_haversine_meters_returns_zero_for_same_point() -> None:
    assert haversine_meters(-19.9321, -43.9385, -19.9321, -43.9385) == 0.0


def test_haversine_meters_calculates_known_distance_in_bh() -> None:
    # Praça da Liberdade até Praça da Savassi (~750m a 850m em linha reta)
    distance = haversine_meters(-19.9320, -43.9380, -19.9390, -43.9360)
    assert 750 <= distance <= 850


def test_deduplicate_bars_prioritizes_name_and_address_over_distance() -> None:
    records = [
        {
            "external_id": "legacy:baiuca",
            "name": "Baiúca",
            "address": "Rua Piauí, 1884, Funcionários",
            "neighborhood": None,
            "category": "buteco",
            "source": "legacy_csv",
            "metadata": {"dataset": "comida_di_buteco_2026"},
            "latitude": -19.93585,
            "longitude": -43.92798,
        },
        {
            "external_id": "osm:node/999",
            "name": "Baiuca",
            "address": "Rua Piaui, 1884, Funcionarios",
            "neighborhood": "Funcionários",
            "category": "bar",
            "source": "osm",
            "metadata": {"phone": "+55 31 3222-1111"},
            # Mesmo com desvio de geocodificação > 50m, nome + endereço confirmam duplicata
            "latitude": -19.93680,
            "longitude": -43.92798,
        },
    ]

    result = deduplicate_bars(records)

    assert len(result) == 1
    assert result[0]["external_id"] == "legacy:baiuca"
    assert result[0]["neighborhood"] == "Funcionários"
    assert result[0]["metadata"] == {
        "dataset": "comida_di_buteco_2026",
        "phone": "+55 31 3222-1111",
        "merged_external_id": "osm:node/999",
    }


def test_deduplicate_bars_keeps_nearby_bars_when_addresses_differ() -> None:
    records = [
        {
            "external_id": "legacy:bar-central",
            "name": "Bar Central",
            "address": "Rua Pernambuco, 100, Savassi",
            "neighborhood": "Savassi",
            "category": "buteco",
            "source": "legacy_csv",
            "metadata": {},
            "latitude": -19.93900,
            "longitude": -43.93600,
        },
        {
            "external_id": "osm:node/555",
            "name": "Bar Central",
            "address": "Avenida Getúlio Vargas, 850, Savassi",
            "neighborhood": "Savassi",
            "category": "bar",
            "source": "osm",
            "metadata": {},
            # Muito próximos (< 20m), mas endereços distintos diferenciam os bares
            "latitude": -19.93905,
            "longitude": -43.93605,
        },
    ]

    result = deduplicate_bars(records)
    assert len(result) == 2


def test_deduplicate_bars_uses_distance_fallback_when_address_is_missing() -> None:
    records = [
        {
            "external_id": "legacy:bar-do-nelson",
            "name": "Bar do Nelson",
            "address": "Rua Vicente Risola, 1000, Santa Inês",
            "neighborhood": "Santa Inês",
            "category": "buteco",
            "source": "legacy_csv",
            "metadata": {"dataset": "comida_di_buteco_2026"},
            "latitude": -19.89000,
            "longitude": -43.90862,
        },
        {
            "external_id": "osm:node/321",
            "name": "Bar do Nelson",
            "address": None,
            "neighborhood": None,
            "category": "bar",
            "source": "osm",
            "metadata": {"opening_hours": "Tu-Su 17:00-23:00"},
            "latitude": -19.89010,
            "longitude": -43.90865,
        },
        {
            "external_id": "osm:node/322",
            "name": "Bar do Nelson",
            "address": None,
            "neighborhood": None,
            "category": "bar",
            "source": "osm",
            "metadata": {},
            # Mesmo nome, sem endereço, mas a ~1 km de distância -> mantém separado
            "latitude": -19.90000,
            "longitude": -43.90862,
        },
    ]

    result = deduplicate_bars(records)

    assert len(result) == 2
    assert result[0]["metadata"]["opening_hours"] == "Tu-Su 17:00-23:00"
    assert result[0]["metadata"]["merged_external_id"] == "osm:node/321"
    assert result[1]["external_id"] == "osm:node/322"


def test_deduplicate_bars_keeps_different_names_at_same_location() -> None:
    records = [
        {
            "external_id": "legacy:bar-alfa",
            "name": "Bar Alfa",
            "address": "Rua Paraíba, 500, Savassi",
            "neighborhood": "Savassi",
            "category": "buteco",
            "source": "legacy_csv",
            "metadata": {},
            "latitude": -19.9321,
            "longitude": -43.9385,
        },
        {
            "external_id": "osm:node/888",
            "name": "Pub Ômega",
            "address": "Rua Paraíba, 500, Savassi",
            "neighborhood": "Savassi",
            "category": "pub",
            "source": "osm",
            "metadata": {},
            "latitude": -19.9321,
            "longitude": -43.9385,
        },
    ]

    assert len(deduplicate_bars(records)) == 2


def test_deduplicate_bars_handles_empty_list() -> None:
    assert deduplicate_bars([]) == []


def test_upsert_bars_returns_zero_for_empty_list(monkeypatch: pytest.MonkeyPatch) -> None:
    mock_connect = MagicMock()
    monkeypatch.setattr("etl.ingest_osm.psycopg.connect", mock_connect)

    assert upsert_bars([], "postgresql://fake") == 0
    mock_connect.assert_not_called()


def test_upsert_bars_executes_batch_and_commits(monkeypatch: pytest.MonkeyPatch) -> None:
    mock_cursor = MagicMock()
    mock_conn = MagicMock()
    mock_conn.cursor.return_value.__enter__.return_value = mock_cursor
    mock_connect = MagicMock()
    mock_connect.return_value.__enter__.return_value = mock_conn
    monkeypatch.setattr("etl.ingest_osm.psycopg.connect", mock_connect)

    records = [
        {
            "external_id": "legacy:baiuca",
            "name": "Baiúca",
            "address": "Rua Piauí, 1884, Funcionários",
            "neighborhood": "Funcionários",
            "category": "buteco",
            "source": "legacy_csv",
            "metadata": {"dataset": "comida_di_buteco_2026"},
            "latitude": -19.9358597,
            "longitude": -43.9279865,
        }
    ]

    count = upsert_bars(records, "postgresql://geobar:geobar@localhost:5432/geobar")

    assert count == 1
    mock_cursor.executemany.assert_called_once()
    _, passed_rows = mock_cursor.executemany.call_args.args
    assert json.loads(passed_rows[0]["metadata"]) == {"dataset": "comida_di_buteco_2026"}
    mock_conn.commit.assert_called_once()


def test_cli_main_dry_run_with_legacy_csv(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch, capsys: pytest.CaptureFixture[str]
) -> None:
    csv_file = tmp_path / "bars.csv"
    csv_file.write_text(
        "name;address;latitude;longitude\nBar Teste;Rua A, 10, Centro;-19.92;-43.93\n",
        encoding="utf-8",
    )
    monkeypatch.setattr(
        "sys.argv",
        ["ingest_osm.py", "--source", "legacy", "--csv-path", str(csv_file), "--dry-run"],
    )

    main()

    output = capsys.readouterr().out
    assert "Legacy CSV: 1 bares carregados." in output
    assert "Dry-run ativo." in output


def test_cli_main_requires_database_url_without_dry_run(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    csv_file = tmp_path / "bars.csv"
    csv_file.write_text(
        "name;address;latitude;longitude\nBar Teste;Rua A, 10, Centro;-19.92;-43.93\n",
        encoding="utf-8",
    )
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.setattr(
        "sys.argv",
        ["ingest_osm.py", "--source", "legacy", "--csv-path", str(csv_file)],
    )

    with pytest.raises(RuntimeError, match="DATABASE_URL"):
        main()
