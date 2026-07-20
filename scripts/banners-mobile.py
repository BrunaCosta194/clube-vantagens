"""Gera versoes mobile (4:3) dos banners largos 1920x465.

Tecnica: fundo = proprio banner escalado em "cover" + blur (mantem cor/textura da marca),
frente  = recorte da regiao de mensagem, escalado pra ~94% da largura, centralizado.
"""
from pathlib import Path
from PIL import Image, ImageFilter, ImageEnhance

SRC = Path(r"C:\Users\Eduardo Hayata\Downloads\clube-vantagens\src\assets\banners")
OUT = SRC / "mobile"
OUT.mkdir(exist_ok=True)

CANVAS = (1080, 810)  # 4:3
FG_W = int(CANVAS[0] * 0.94)

# regiao da mensagem principal em cada banner (x0, y0, x1, y1) sobre 1920x465
BOXES = {
    "hero-clube.jpg":          (100,  85, 1320, 425),
    "sanchez-premium.jpg":     (250,  40, 1330, 355),
    "oticas-diniz.jpg":       (1105,  25, 1910, 460),
    "bioreluz.jpg":            (470, 125, 1310, 340),
    "insurance-sante.jpg":     (130,  55,  730, 350),
    "mrt.jpg":                 (555,  25, 1335, 405),
    "remalar.jpg":             (495, 115, 1425, 325),
    "renova-lar.jpg":         (1310, 100, 1845, 335),
}

FILES = {
    "hero-clube.jpg": "hero-clube.jpg",
    "sanchez-premium.jpg": "sanchez-premium-banner.jpg",
    "oticas-diniz.jpg": "oticas-diniz-banner.jpg",
    "bioreluz.jpg": "bioreluz-banner.jpg",
    "insurance-sante.jpg": "insurance-sante-banner.jpg",
    "mrt.jpg": "mrt-banner.jpg",
    "remalar.jpg": "remalar-banner.jpg",
    "renova-lar.jpg": "renova-lar-banner.jpg",
}


def cover(im, size):
    """Escala preservando proporcao ate cobrir `size`, depois corta o centro."""
    cw, ch = size
    scale = max(cw / im.width, ch / im.height)
    resized = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    left = (resized.width - cw) // 2
    top = (resized.height - ch) // 2
    return resized.crop((left, top, left + cw, top + ch))


for out_name, src_name in FILES.items():
    src = Image.open(SRC / src_name).convert("RGB")

    bg = cover(src, CANVAS).filter(ImageFilter.GaussianBlur(28))
    bg = ImageEnhance.Brightness(bg).enhance(0.92)

    fg = src.crop(BOXES[out_name])
    fg_h = round(fg.height * FG_W / fg.width)
    fg = fg.resize((FG_W, fg_h), Image.LANCZOS)

    canvas = bg.copy()
    canvas.paste(fg, ((CANVAS[0] - FG_W) // 2, (CANVAS[1] - fg_h) // 2))
    canvas.save(OUT / out_name, "JPEG", quality=86, optimize=True, progressive=True)
    print(out_name, canvas.size, "fg", fg.size)
