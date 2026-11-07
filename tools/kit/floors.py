# Tileable floor textures for sheet C #9: herringbone oak, grey/cream check, lilac carpet, terrazzo. Clean, no wear.
from PIL import Image, ImageDraw, ImageFilter
import random, math
N = 512; random.seed(7)
def save(im, name): im.save(f'out/floor_{name}.png'); im.convert('RGB').save(f'../../assets/floor_{name}.jpg', quality=86)

# herringbone: planks 1:4, alternating 45° — drawn on a 2x canvas and wrapped so it tiles
def herringbone():  # axis-aligned staircase herringbone (tiles every N); the game rotates it 45° with texture.rotation
    S = N; a = S // 8; im = Image.new('RGB', (S, S), '#B98642'); d = ImageDraw.Draw(im)
    tones = ['#E2B064', '#D9A55A', '#D19C50', '#E7B86E', '#DCA95F']
    def plank(x, y, w, h):
        t = random.choice(tones)
        for dx in (-S, 0, S):
            for dy in (-S, 0, S): d.rounded_rectangle([x + dx + 1, y + dy + 1, x + dx + w - 2, y + dy + h - 2], 3, fill=t)
    for k in range(-2, 3):
        for i in range(-2, 10):
            x, y = i * a, i * a + k * 4 * a
            plank(x, y, 2 * a, a); plank(x, y + a, a, 2 * a)
    g = Image.effect_noise((S, S), 14).convert('L'); im = Image.blend(im, Image.merge('RGB', (g, g, g)), 0.04)
    return im

def check():
    im = Image.new('RGB', (N, N), '#DCD6CB'); d = ImageDraw.Draw(im); n = 4; c = N // n
    for i in range(n):
        for j in range(n): d.rounded_rectangle([i * c + 2, j * c + 2, (i + 1) * c - 2, (j + 1) * c - 2], 6, fill='#8E9AAE' if (i + j) % 2 else '#F2ECE0')
    return im

def carpet():  # soft lilac loop pile: two-tone fleck, no pattern
    nz = Image.effect_noise((N, N), 60).convert('L').filter(ImageFilter.GaussianBlur(0.9))
    im = Image.composite(Image.new('RGB', (N, N), '#B6A3D8'), Image.new('RGB', (N, N), '#9580BC'), nz)
    d = ImageDraw.Draw(im)
    for _ in range(2600): x, y = random.randrange(N), random.randrange(N); d.point((x, y), fill=random.choice(['#C9B9E6', '#8B76B2']))
    return im

def terrazzo():
    im = Image.new('RGB', (N, N), '#F3ECE2'); d = ImageDraw.Draw(im); cols = ['#E4B3A4', '#A9C7B9', '#EBD39C', '#B4BED8', '#DDB0BE', '#CFC8BC', '#CFC8BC']  # muted, so the lobby stays calm
    for _ in range(150):
        x, y, r = random.uniform(0, N), random.uniform(0, N), random.uniform(5, 15); c = random.choice(cols); k = random.randint(5, 8)
        pts = [(x + r * random.uniform(0.6, 1) * math.cos(a * 2 * math.pi / k + random.random() * 0.4), y + r * random.uniform(0.6, 1) * math.sin(a * 2 * math.pi / k)) for a in range(k)]
        for dx in (-N, 0, N):
            for dy in (-N, 0, N): d.polygon([(a + dx, b + dy) for a, b in pts], fill=c)
    return im

for n, f in [('herring', herringbone), ('check', check), ('carpet', carpet), ('terrazzo', terrazzo)]: save(f(), n)
b = Image.new('RGB', (4 * 260 + 50, 280), 'white')
for i, n in enumerate(['herring', 'check', 'carpet', 'terrazzo']):
    t = Image.open(f'out/floor_{n}.png').resize((256, 256)); m = Image.new('L', (256, 256), 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, 255, 255], 18, fill=255); b.paste(t, (10 + i * 270, 12), m)
b.save('out/board_floors.png'); print('ok')
