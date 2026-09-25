# -*- coding: utf-8 -*-
"""Recorte mobile das artes BioReluz e Insurance & Sante.

Diferente do banners-mobile.py (que so encolhe a faixa larga dentro de um
fundo borrado), aqui a arte e REMONTADA: fundo da propria marca ocupando a
tela inteira e os elementos (logo, produtos, familia) reposicionados em
tamanho util no 4:3 do celular. Mascara com borda suave pra nao aparecer
emenda no fundo texturizado.
"""
from pathlib import Path
from PIL import Image, ImageFilter, ImageDraw

SRC = Path(r"C:\Users\Eduardo Hayata\Downloads\clube-vantagens\src\assets\banners")
OUT = SRC / "mobile"
OUT.mkdir(parents=True, exist_ok=True)
CANVAS = (1080, 810)


def cover(im, size, blur=0):
    cw, ch = size
    s = max(cw / im.width, ch / im.height)
    r = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    left, top = (r.width - cw) // 2, (r.height - ch) // 2
    r = r.crop((left, top, left + cw, top + ch))
    return r.filter(ImageFilter.GaussianBlur(blur)) if blur else r


def largura(im, w):
    return im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)


def colar_suave(canvas, img, pos, feather=26):
    m = Image.new("L", img.size, 0)
    d = ImageDraw.Draw(m)
    d.rectangle([feather, feather, img.width - feather, img.height - feather], fill=255)
    canvas.paste(img, pos, m.filter(ImageFilter.GaussianBlur(feather / 2)))


# ─── BioReluz ───
b = Image.open(SRC / "bioreluz-banner.jpg").convert("RGB")
# fundo: faixa de agua logo abaixo do logo — mesma luz e textura da area onde
# o logo vai cair, senao aparece retangulo de tom diferente na emenda.
fundo = cover(b.crop((620, 350, 1400, 462)), CANVAS, blur=9)
onda = largura(b.crop((600, 0, 1450, 148)), CANVAS[0])
fundo.paste(onda, (0, 0))

logo = largura(b.crop((470, 120, 1310, 345)), 900)
colar_suave(fundo, logo, ((CANVAS[0] - logo.width) // 2, 195), feather=34)

# maquina menor e mais pra baixo: encostava no B do logo
# corte abaixo da onda escura: com ela junto aparecia um retangulo
# escuro em volta da maquina na agua clara.
maquina = largura(b.crop((178, 78, 338, 462)), 135)
colar_suave(fundo, maquina, (45, CANVAS[1] - 360), feather=18)

produtos = largura(b.crop((1480, 70, 1900, 440)), 420)
colar_suave(fundo, produtos, (CANVAS[0] - produtos.width - 25, CANVAS[1] - produtos.height - 15), feather=22)

fundo.save(OUT / "bioreluz.jpg", "JPEG", quality=88, optimize=True, progressive=True)

# ─── Insurance & Sante ───
i = Image.open(SRC / "insurance-sante-banner.jpg").convert("RGB")
# fundo: a propria metade esquerda da arte, onde a marca ja vive — tom igual
# faixa da borda esquerda: degrade puro. Pegar a metade esquerda inteira
# trazia o nome da marca borrado como fantasma atras da lista.
fundo2 = cover(i.crop((0, 0, 125, 465)), CANVAS, blur=14)

marca = largura(i.crop((120, 55, 740, 350)), 820)
colar_suave(fundo2, marca, ((CANVAS[0] - marca.width) // 2, 55), feather=34)

lista = largura(i.crop((1055, 118, 1410, 322)), 510)
colar_suave(fundo2, lista, (50, 500), feather=30)

familia = largura(i.crop((1430, 10, 1920, 465)), 400)
colar_suave(fundo2, familia, (CANVAS[0] - familia.width - 5, CANVAS[1] - 372), feather=16)

fundo2.save(OUT / "insurance-sante.jpg", "JPEG", quality=88, optimize=True, progressive=True)
print("ok")
