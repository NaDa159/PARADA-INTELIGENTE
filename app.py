import argparse
import json
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

import pandas as pd
from jinja2 import Environment, FileSystemLoader, select_autoescape


PASTA_PROJETO = Path(__file__).resolve().parent
PASTA_DADOS = PASTA_PROJETO / "dados"
FICHEIRO_DADOS = PASTA_DADOS / "paradas.csv"
FICHEIRO_ROTAS = PASTA_DADOS / "rotas.json"
FICHEIRO_HTML = PASTA_PROJETO / "mapa_paradas.html"
FICHEIRO_TEMPLATE = PASTA_PROJETO / "templates"
COLUNAS_OBRIGATORIAS = {"nome", "latitude", "longitude", "categoria", "observacao"}


def carregar_paradas() -> list[dict]:
    paradas_df = pd.read_csv(FICHEIRO_DADOS, encoding="utf-8")
    colunas_em_falta = COLUNAS_OBRIGATORIAS.difference(paradas_df.columns)
    if colunas_em_falta:
        nomes = ", ".join(sorted(colunas_em_falta))
        raise ValueError(f"Faltam colunas obrigatórias em paradas.csv: {nomes}")
    if paradas_df.empty:
        raise ValueError("O ficheiro paradas.csv não contém nenhum ponto de referência.")

    paradas_df["latitude"] = pd.to_numeric(paradas_df["latitude"], errors="coerce")
    paradas_df["longitude"] = pd.to_numeric(paradas_df["longitude"], errors="coerce")
    campos = ["nome", "latitude", "longitude", "categoria", "observacao"]
    if paradas_df[campos].isna().any().any():
        raise ValueError("Cada ponto precisa de nome, coordenadas, categoria e observação válidos.")
    if not paradas_df["latitude"].between(-90, 90).all():
        raise ValueError("As latitudes devem estar entre -90 e 90.")
    if not paradas_df["longitude"].between(-180, 180).all():
        raise ValueError("As longitudes devem estar entre -180 e 180.")

    return [
        {
            "nome": str(linha.nome),
            "latitude": float(linha.latitude),
            "longitude": float(linha.longitude),
            "categoria": str(linha.categoria).strip(),
            "observacao": str(linha.observacao).strip(),
        }
        for linha in paradas_df.itertuples(index=False)
    ]


def carregar_rotas(paradas: list[dict]) -> list[dict]:
    rotas = json.loads(FICHEIRO_ROTAS.read_text(encoding="utf-8"))
    coordenadas = {parada["nome"]: [parada["longitude"], parada["latitude"]] for parada in paradas}
    for rota in rotas:
        nomes_em_falta = [nome for nome in rota["pontos"] if nome not in coordenadas]
        if nomes_em_falta:
            raise ValueError(
                f"A linha {rota['linha']} referencia pontos ausentes em paradas.csv: "
                + ", ".join(nomes_em_falta)
            )
        rota["coordenadas"] = [coordenadas[nome] for nome in rota["pontos"]]
    if not rotas:
        raise ValueError("O ficheiro rotas.json não contém linhas para apresentar.")
    return rotas


def criar_pagina() -> None:
    """Gera a página do mapa de Erechim com os roteiros e pontos de referência."""
    paradas = carregar_paradas()
    rotas = carregar_rotas(paradas)
    centro = [-27.6339, -52.2739]

    ambiente = Environment(
        loader=FileSystemLoader(FICHEIRO_TEMPLATE),
        autoescape=select_autoescape(["html"]),
    )
    template = ambiente.get_template("index.html")
    pagina = template.render(paradas=paradas, rotas=rotas, centro=centro)
    FICHEIRO_HTML.write_text(pagina, encoding="utf-8")
    print(f"Página criada: {FICHEIRO_HTML}")


def servir_pagina(porta: int) -> None:
    """Serve a página no localhost para o navegador carregar os recursos web."""
    handler = partial(SimpleHTTPRequestHandler, directory=str(PASTA_PROJETO))
    servidor = ThreadingHTTPServer(("127.0.0.1", porta), handler)
    print(f"Aplicação disponível em http://127.0.0.1:{porta}/mapa_paradas.html")
    print("Prima Ctrl+C para parar o servidor.")
    try:
        servidor.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor parado.")
    finally:
        servidor.server_close()


def main() -> None:
    parser = argparse.ArgumentParser(description="Mapa interativo das linhas de ônibus de Erechim")
    parser.add_argument(
        "--serve",
        action="store_true",
        help="gera a página e serve-a em localhost para abrir no navegador",
    )
    parser.add_argument("--port", type=int, default=8000, help="porta local (padrão: 8000)")
    argumentos = parser.parse_args()

    criar_pagina()
    if argumentos.serve:
        servir_pagina(argumentos.port)


if __name__ == "__main__":
    main()
