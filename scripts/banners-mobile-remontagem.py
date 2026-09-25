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


def salvar(im, nome):
    im.save(OUT / nome, "JPEG", quality=88, optimize=True, progressive=True)


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

# ─── Comunidade Sanchez ───
c = Image.open(SRC / "topo-clube.jpg").convert("RGB")
cv = cover(c.crop((300, 360, 1250, 462)), CANVAS, blur=10)
txt = largura(c.crop((85, 95, 1305, 368)), 1010)
colar_suave(cv, txt, ((CANVAS[0] - txt.width) // 2, 130), feather=30)
cel = largura(c.crop((1330, 5, 1720, 465)), 300)
colar_suave(cv, cel, (CANVAS[0] - cel.width - 60, CANVAS[1] - cel.height - 10), feather=20)
salvar(cv, "topo-clube.jpg")

# ─── Loja Sanchez ───
l = Image.open(SRC / "topo-loja.jpg").convert("RGB")
lv = cover(l.crop((980, 330, 1520, 458)), CANVAS, blur=12)
txt = largura(l.crop((690, 148, 1520, 322)), 960)
colar_suave(lv, txt, ((CANVAS[0] - txt.width) // 2, 150), feather=28)
caneca = largura(l.crop((0, 15, 700, 465)), 540)
colar_suave(lv, caneca, (10, CANVAS[1] - 360), feather=22)
brinco = largura(l.crop((1630, 0, 1860, 420)), 210)
colar_suave(lv, brinco, (CANVAS[0] - 225, CANVAS[1] - 400), feather=18)
salvar(lv, "topo-loja.jpg")

# ─── Papo de Aluguel ───
p = Image.open(SRC / "topo-papo.jpg").convert("RGB")
pv = cover(p.crop((700, 320, 1500, 462)), CANVAS, blur=10)
txt = largura(p.crop((765, 48, 1700, 312)), 1000)
colar_suave(pv, txt, ((CANVAS[0] - txt.width) // 2, 120), feather=28)
yru = largura(p.crop((20, 5, 680, 465)), 580)
colar_suave(pv, yru, (0, CANVAS[1] - 405), feather=22)
mic = largura(p.crop((1760, 5, 1920, 465)), 150)
colar_suave(pv, mic, (CANVAS[0] - 150, CANVAS[1] - 430), feather=16)
salvar(pv, "topo-papo.jpg")

# ─── Sanchez Premium ───
s = Image.open(SRC / "topo-premium.jpg").convert("RGB")
# area escura entre o texto e a moca: sem letra pra virar fantasma
sv = cover(s.crop((1150, 30, 1390, 430)), CANVAS, blur=12)
txt = largura(s.crop((230, 55, 1240, 355)), 960)
colar_suave(sv, txt, ((CANVAS[0] - txt.width) // 2, 130), feather=28)
# a linha "Ha mais de 53 anos..." fica de fora no celular: no 4:3 ela so
# cabe em corpo minusculo e a moca cobria o fim da frase.
mulher = largura(s.crop((1400, 5, 1800, 465)), 400)
colar_suave(sv, mulher, (CANVAS[0] - 400, CANVAS[1] - 455), feather=20)
salvar(sv, "topo-premium.jpg")

print("ok")
