# Room architecture kit (Blender 5.2, run headless: python3 room_kit.py OUT.glb [preview.png])
# Every piece is modelled in GAME space (three.js: x along the wall, y up, +z = outside of the room) and converted to Blender on creation.
# Straight pieces span x -0.5..0.5 (the game stretches them along x to the wall length); wall bodies are 1 high (stretched to the room height).
# Corner pieces are quarter rings around the corner centre, from +x to +z, at the wall line radius RC (the game mirrors them per corner).
import bpy, bmesh, math, sys
from mathutils import Vector

RC = 0.38                       # corner radius on the wall line (same as DIO_RC in the game)
IN, OUT = 0.12, 0.07            # wall body: inner face at z=-IN, outer face at z=+OUT
DOOR_W, DOOR_H = 1.15, 2.15     # door opening (same as the game)
WIN_W, WIN_H, WIN_Y = 1.1, 1.15, 1.05

def B(p):  # game (x, y, z) -> Blender (x, -z, y)
    return Vector((p[0], -p[2], p[1]))

bpy.ops.wm.read_factory_settings(use_empty=True)
MATS = {}
def mat(name, hexc, rough=0.7):
    if name in MATS: return MATS[name]
    m = bpy.data.materials.new(name); m.use_nodes = True
    c = [int(hexc[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    lin = [((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c]
    bsdf = m.node_tree.nodes['Principled BSDF']; bsdf.inputs['Base Color'].default_value = (*lin, 1); bsdf.inputs['Roughness'].default_value = rough
    m.diffuse_color = (*lin, 1); MATS[name] = m; return m

# ---- the one material set, shared by every room (paint and door are white/neutral so the game can tint them per room) ----
M = {
    'paint': mat('k_paint', '#FFFFFF', 0.92),      # inner wall paint (tinted per room)
    'outer': mat('k_outer', '#FFFFFF', 0.92),      # outer wall face (tinted per room, a shade deeper)
    'rim':   mat('k_rim', '#E3AD89', 0.72),        # warm sand crown on top of every wall, door frames
    'trim':  mat('k_trim', '#FBF5EA', 0.6),        # skirting, window frames
    'plinth': mat('k_plinth', '#F2E7D5', 0.85),    # outer base
    'door':  mat('k_door', '#FFFFFF', 0.55),       # door leaf (tinted per room)
    'metal': mat('k_brass', '#D9A94E', 0.35),
    'glass': mat('k_glass', '#A8CFEF', 0.12),
    'wood':  mat('k_wood', '#9A6743', 0.75),
}

def obj_from(bm, name, m):
    me = bpy.data.meshes.new(name); bm.normal_update(); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(o); me.materials.append(m)
    for p in me.polygons: p.use_smooth = True
    return o

def arc(cz, cy, r, a0, a1, n=8):  # points (z, y) on an arc, angles in degrees
    return [(cz + r * math.cos(math.radians(a0 + (a1 - a0) * i / n)), cy + r * math.sin(math.radians(a0 + (a1 - a0) * i / n))) for i in range(n + 1)]

def rrect(z0, z1, y0, y1, r, n=5):  # rounded rectangle profile, counter-clockwise in (z, y)
    r = min(r, (z1 - z0) / 2, (y1 - y0) / 2)
    return arc(z1 - r, y0 + r, r, -90, 0, n) + arc(z1 - r, y1 - r, r, 0, 90, n) + arc(z0 + r, y1 - r, r, 90, 180, n) + arc(z0 + r, y0 + r, r, 180, 270, n)

def sweep(name, prof, path, m, closed_path=False, cap=True):
    """prof: closed list of (u, v) = (offset along the path normal, offset along z); path: list of (P(x,y,z), N(x,y,z)) in game space."""
    bm = bmesh.new(); rings = []
    for P, Nn in path:
        Z = Vector((0, 0, 1)); rings.append([bm.verts.new(B((P[0] + Nn[0] * u, P[1] + Nn[1] * u, P[2] + v))) for (u, v) in prof])
    k = len(prof); segs = len(rings) if closed_path else len(rings) - 1
    for i in range(segs):
        a, b = rings[i], rings[(i + 1) % len(rings)]
        for j in range(k): bm.faces.new((a[j], a[(j + 1) % k], b[(j + 1) % k], b[j]))
    if cap and not closed_path:
        bm.faces.new(rings[0][::-1]); bm.faces.new(rings[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return obj_from(bm, name, m)

def straight(name, prof, m):  # profile (z, y) extruded along x -0.5..0.5
    return sweep(name, [(y, z) for (z, y) in prof], [((x, 0, 0), (0, 1, 0)) for x in (-0.5, 0.5)], m)

def corner(name, prof, m, n=18):  # the same profile revolved a quarter turn around the corner centre; z offset = radial offset
    path = []
    for i in range(n + 1):
        t = math.radians(90 * i / n); path.append(t)
    bm = bmesh.new(); rings = []
    for t in path:
        rings.append([bm.verts.new(B(((RC + z) * math.cos(t), y, (RC + z) * math.sin(t)))) for (z, y) in prof])
    k = len(prof)
    for i in range(len(rings) - 1):
        a, b = rings[i], rings[i + 1]
        for j in range(k): bm.faces.new((a[j], a[(j + 1) % k], b[(j + 1) % k], b[j]))
    bm.faces.new(rings[0][::-1]); bm.faces.new(rings[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return obj_from(bm, name, m)

# ---- profiles (z across the wall, y up), all counter-clockwise ----
P_IN = [(-IN, 0), (-0.015, 0), (-0.015, 1), (-IN, 1)]                       # paint layer, 1 high
P_OUT = [(-0.015, 0), (OUT, 0), (OUT, 1), (-0.015, 1)]                     # outer layer, 1 high
# crown: a fat rounded bullnose (the toy look) sitting on a slim bead on each face; local y=0 is the top of the wall body
RR, OV = 0.065, 0.075   # crown: rounded nose radius and overhang past each face
P_RIM = ([(-IN - 0.02, -0.04), (OUT + 0.02, -0.04)] + arc(OUT + 0.02, -0.02, 0.02, -90, 90, 4)[1:-1] +
         [(OUT + 0.02, 0.0), (OUT + OV, 0.0)] + arc(OUT + OV - RR, RR, RR, -90, 90, 8)[1:] +
         arc(-IN - OV + RR, RR, RR, 90, 270, 8)[:-1] + [(-IN - OV, 0.0), (-IN - 0.02, 0.0)] +
         arc(-IN - 0.02, -0.02, 0.02, 90, 270, 4)[1:-1])
P_SKIRT = [(-IN - 0.035, 0), (-IN + 0.002, 0), (-IN + 0.002, 0.16)] + arc(-IN - 0.035 + 0.02, 0.14, 0.02, 90, 180, 4) + [(-IN - 0.035, 0.0)]
P_SKIRT = P_SKIRT[:-1]
P_PLINTH = [(OUT - 0.002, 0), (OUT + 0.045, 0)] + arc(OUT + 0.045 - 0.022, 0.40, 0.022, 0, 90, 4) + [(OUT - 0.002, 0.422)]
P_FLOOR = rrect(-0.02, 0.16, -0.12, 0.02, 0.05)                             # rounded slab edge under the floor, outside the wall line

straight('k_wall_in', P_IN, M['paint']); straight('k_wall_out', P_OUT, M['outer'])
straight('k_rim', P_RIM, M['rim']); straight('k_skirt', P_SKIRT, M['trim']); straight('k_plinth', P_PLINTH, M['plinth'])
straight('k_floor_edge', P_FLOOR, M['plinth'])
corner('k_c_wall_in', P_IN, M['paint']); corner('k_c_wall_out', P_OUT, M['outer'])
corner('k_c_rim', P_RIM, M['rim']); corner('k_c_skirt', P_SKIRT, M['trim']); corner('k_c_plinth', P_PLINTH, M['plinth'])
corner('k_c_floor_edge', P_FLOOR, M['plinth'])

# ---- arched door: chunky frame swept around the opening on both faces, a panelled leaf, brass knob, wooden step ----
def arch_path(w, h, inset=0.0, n=24):
    r = w / 2; pts = []
    pts.append(((-r, 0, 0), (-1, 0, 0)))
    pts.append(((-r, h - r, 0), (-1, 0, 0)))
    for i in range(1, n):
        t = math.pi - math.pi * i / n; pts.append(((r * math.cos(t), h - r + r * math.sin(t), 0), (math.cos(t), math.sin(t), 0)))
    pts.append(((r, h - r, 0), (1, 0, 0))); pts.append(((r, 0, 0), (1, 0, 0)))
    return pts
FR = [(u, v) for (v, u) in rrect(-IN - 0.06, OUT + 0.06, 0.0, 0.15, 0.04)]   # (u outward from the opening 0..0.15, v across the wall)
sweep('k_doorframe', FR, [((P[0], P[1] + 0.1, P[2]), N) for P, N in arch_path(DOOR_W, DOOR_H)], M['rim'])
def arch_slab(name, w, h, z0, z1, m, y0=0.1, n=20):
    r = w / 2; outline = [(-r, 0)] + [(r * math.cos(math.pi - math.pi * i / n), h - r + r * math.sin(math.pi - math.pi * i / n)) for i in range(n + 1)] + [(r, 0)]
    bm = bmesh.new(); f = bm.faces.new([bm.verts.new(B((x, y + y0, z0))) for (x, y) in outline])
    ex = bmesh.ops.extrude_face_region(bm, geom=[f]); vs = [e for e in ex['geom'] if isinstance(e, bmesh.types.BMVert)]
    bmesh.ops.translate(bm, verts=vs, vec=B((0, 0, z1 - z0)) - B((0, 0, 0)))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces); o = obj_from(bm, name, m)
    bv = o.modifiers.new('bev', 'BEVEL'); bv.width = 0.012; bv.segments = 2; bv.limit_method = 'ANGLE'; return o
arch_slab('k_door', DOOR_W - 0.02, DOOR_H - 0.01, -0.035, 0.035, M['door'])
arch_slab('k_door_panel', DOOR_W - 0.34, DOOR_H - 0.55, 0.035, 0.055, M['door'], y0=0.42)
arch_slab('k_door_panel_in', DOOR_W - 0.34, DOOR_H - 0.55, -0.055, -0.035, M['door'], y0=0.42)
for s in (-1, 1):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.04, location=B((DOOR_W / 2 - 0.16, 1.1, s * 0.07))); o = bpy.context.object; o.name = 'k_knob' if s > 0 else 'k_knob_in'; o.data.materials.append(M['metal'])
    for p in o.data.polygons: p.use_smooth = True
bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1); bmesh.ops.scale(bm, vec=(DOOR_W + 0.3, 0.42, 0.08), verts=bm.verts); bmesh.ops.translate(bm, vec=B((0, 0.04, OUT + 0.21)), verts=bm.verts)
o = obj_from(bm, 'k_doorstep', M['wood']); bv = o.modifiers.new('bev', 'BEVEL'); bv.width = 0.02; bv.segments = 3

# ---- window: deep rounded frame, cross mullion, glass, a sill on both faces ----
def rect_path(w, h, y0):
    pts = []; hw = w / 2
    corners = [(-hw, y0, (-1, 0)), (-hw, y0 + h, (-1, 1)), (hw, y0 + h, (1, 1)), (hw, y0, (1, -1))]
    for (x, y, _) in corners: pass
    seq = [((-hw, y0, 0), (-0.7071, -0.7071, 0)), ((-hw, y0 + h, 0), (-0.7071, 0.7071, 0)), ((hw, y0 + h, 0), (0.7071, 0.7071, 0)), ((hw, y0, 0), (0.7071, -0.7071, 0))]
    return seq
WF = [(u, v) for (v, u) in rrect(-IN - 0.03, OUT + 0.03, 0.0, 0.11, 0.03)]
# window frame as four rounded bars (simpler and crisper than a mitred sweep)
def bar(name, sx, sy, sz, loc, m, bev=0.025):
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1); bmesh.ops.scale(bm, vec=(sx, sz, sy), verts=bm.verts); bmesh.ops.translate(bm, vec=B(loc), verts=bm.verts)
    o = obj_from(bm, name, m); b = o.modifiers.new('bev', 'BEVEL'); b.width = bev; b.segments = 3; return o
fw, fd = 0.11, IN + OUT + 0.06
bar('k_win_l', fw, WIN_H + 2 * fw, fd, (-WIN_W / 2 - fw / 2, WIN_Y + WIN_H / 2, (OUT - IN) / 2), M['trim'])
bar('k_win_r', fw, WIN_H + 2 * fw, fd, (WIN_W / 2 + fw / 2, WIN_Y + WIN_H / 2, (OUT - IN) / 2), M['trim'])
bar('k_win_t', WIN_W, fw, fd, (0, WIN_Y + WIN_H + fw / 2, (OUT - IN) / 2), M['trim'])
bar('k_win_b', WIN_W, fw, fd, (0, WIN_Y - fw / 2, (OUT - IN) / 2), M['trim'])
bar('k_win_mv', 0.05, WIN_H, IN + OUT + 0.05, (0, WIN_Y + WIN_H / 2, (OUT - IN) / 2), M['trim'], 0.012)
bar('k_win_mh', WIN_W, 0.05, IN + OUT + 0.05, (0, WIN_Y + WIN_H * 0.55, (OUT - IN) / 2), M['trim'], 0.012)
bar('k_win_glass', WIN_W, WIN_H, IN + OUT + 0.02, (0, WIN_Y + WIN_H / 2, (OUT - IN) / 2), M['glass'], 0.004)
bar('k_win_sill', WIN_W + 0.42, 0.07, 0.2, (0, WIN_Y - fw - 0.02, -IN - 0.07), M['trim'], 0.03)
bar('k_win_sill_out', WIN_W + 0.42, 0.07, 0.18, (0, WIN_Y - fw - 0.02, OUT + 0.06), M['trim'], 0.03)

for o in bpy.context.scene.objects:
    if o.type == 'MESH': o.data.set_sharp_from_angle(angle=math.radians(35))

OUTP = sys.argv[1]
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=OUTP, export_format='GLB', export_apply=True, export_yup=True, export_materials='EXPORT')
dg = bpy.context.evaluated_depsgraph_get(); tris = 0
for o in bpy.context.scene.objects:
    if o.type == 'MESH': e = o.evaluated_get(dg).to_mesh(); e.calc_loop_triangles(); tris += len(e.loop_triangles); o.evaluated_get(dg).to_mesh_clear()
print('KIT', OUTP, len([o for o in bpy.context.scene.objects if o.type == 'MESH']), 'pieces', tris, 'tris')
