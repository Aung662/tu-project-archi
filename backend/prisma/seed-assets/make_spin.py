"""
Render a 24-frame 360 turntable of a simple 3D device enclosure.

Programmatic (not AI) so every frame is perfectly consistent — the whole point
of a spin viewer is that only the viewing angle changes between frames.
A rounded box with a top display panel and side buttons is rotated about the
vertical axis and drawn with a painter's-algorithm shaded projection.
"""
import math
import os
from PIL import Image, ImageDraw

W = H = 600
N = 24  # frames
OUT = os.path.join(os.path.dirname(__file__), "spin")
os.makedirs(OUT, exist_ok=True)

# Box half-dimensions (x width, y height, z depth)
BX, BY, BZ = 1.4, 0.9, 1.0

def roty(p, a):
    x, y, z = p
    ca, sa = math.cos(a), math.sin(a)
    return (x * ca + z * sa, y, -x * sa + z * ca)

TILT = -0.42  # camera looks slightly down so the top panel is visible

def rotx(p, a):
    x, y, z = p
    ca, sa = math.cos(a), math.sin(a)
    return (x, y * ca - z * sa, y * sa + z * ca)

def view(p, a):
    return rotx(roty(p, a), TILT)

def project(p, cam=9.0, scale=120):
    x, y, z = p
    f = cam / (cam - z)
    return (W / 2 + x * f * scale, H / 2 - y * f * scale)

# Faces of the enclosure: (list of 3D verts, base color)
def make_faces():
    v = {
        "ftl": (-BX,  BY,  BZ), "ftr": ( BX,  BY,  BZ),
        "fbl": (-BX, -BY,  BZ), "fbr": ( BX, -BY,  BZ),
        "btl": (-BX,  BY, -BZ), "btr": ( BX,  BY, -BZ),
        "bbl": (-BX, -BY, -BZ), "bbr": ( BX, -BY, -BZ),
    }
    return [
        ([v["ftl"], v["ftr"], v["fbr"], v["fbl"]], (54, 118, 224)),   # front
        ([v["btr"], v["btl"], v["bbl"], v["bbr"]], (30, 72, 150)),    # back
        ([v["ftr"], v["btr"], v["bbr"], v["fbr"]], (44, 96, 190)),    # right
        ([v["btl"], v["ftl"], v["fbl"], v["bbl"]], (44, 96, 190)),    # left
        ([v["btl"], v["btr"], v["ftr"], v["ftl"]], (120, 170, 255)),  # top
        ([v["fbl"], v["fbr"], v["bbr"], v["bbl"]], (20, 40, 80)),     # bottom
    ]

# A screen panel slightly in front of the top face
def screen_face():
    y = BY + 0.001
    m = 0.28
    return ([(-BX + m, y, BZ - m), (BX - m, y, BZ - m),
             (BX - m, y, -BZ + m + 0.4), (-BX + m, y, -BZ + m + 0.4)], (12, 20, 30))

def normal(face):
    (a, b, c) = face[0][:3]
    ux, uy, uz = (b[0]-a[0], b[1]-a[1], b[2]-a[2])
    vx, vy, vz = (c[0]-a[0], c[1]-a[1], c[2]-a[2])
    return (uy*vz - uz*vy, uz*vx - ux*vz, ux*vy - uy*vx)

LIGHT = (0.4, 0.8, 0.5)

def shade(color, nrm):
    ln = math.sqrt(sum(c*c for c in nrm)) or 1
    n = [c/ln for c in nrm]
    ll = math.sqrt(sum(c*c for c in LIGHT))
    l = [c/ll for c in LIGHT]
    diff = max(0.25, n[0]*l[0] + n[1]*l[1] + n[2]*l[2])
    return tuple(min(255, int(c * (0.55 + 0.6*diff))) for c in color)

for i in range(N):
    a = (i / N) * 2 * math.pi
    img = Image.new("RGB", (W, H), (11, 18, 32))
    d = ImageDraw.Draw(img)
    # soft ground shadow
    d.ellipse([W/2-150, H-150, W/2+150, H-90], fill=(6, 10, 20))

    faces = make_faces() + [screen_face()]
    drawn = []
    for verts, col in faces:
        rv = [view(p, a) for p in verts]
        depth = sum(p[2] for p in rv) / len(rv)
        nrm = normal([rv])
        # backface cull by camera direction (+z toward viewer)
        drawn.append((depth, rv, col, nrm))
    drawn.sort(key=lambda t: t[0])  # far to near

    for depth, rv, col, nrm in drawn:
        # skip faces pointing away
        if nrm[2] <= 0 and col != (12, 20, 30):
            continue
        pts = [project(p) for p in rv]
        d.polygon(pts, fill=shade(col, nrm), outline=(9, 14, 26))

    # little LED dot on the front-ish position
    led = project(view((0.9, -0.4, BZ), a))
    if view((0.9, -0.4, BZ), a)[2] > 0:
        d.ellipse([led[0]-6, led[1]-6, led[0]+6, led[1]+6], fill=(90, 240, 180))

    img.save(os.path.join(OUT, f"frame-{i:02d}.jpg"), quality=82)

print(f"Wrote {N} frames to {OUT}")
