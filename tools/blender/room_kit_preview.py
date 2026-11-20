# Render a sample room assembled from the kit, the way the game will place it (python3 room_kit_preview.py kit.glb out.png [wall hex] [door hex])
import bpy, math, sys
from mathutils import Vector, Matrix
KIT, OUTP = sys.argv[1], sys.argv[2]
WALL = sys.argv[3] if len(sys.argv) > 3 else '#E98C78'; DOOR = sys.argv[4] if len(sys.argv) > 4 else '#2E3D6B'
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=KIT)
P = {o.name: o for o in bpy.context.scene.objects if o.type == 'MESH'}
for o in P.values(): o.hide_render = True; o.hide_viewport = True
def lin(h): c = [int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)]; return [((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c]
def tinted(base, hexc, k=1.0):
    m = base.copy(); b = m.node_tree.nodes.get('Principled BSDF'); c = lin(hexc); b.inputs['Base Color'].default_value = (c[0] * k, c[1] * k, c[2] * k, 1); return m
RC, H, Y0 = 0.38, 2.27, 0.1
def place(name, M, mats=None):
    src = P[name]; o = src.copy(); o.data = src.data.copy(); o.hide_render = False; o.hide_viewport = False
    bpy.context.scene.collection.objects.link(o); o.matrix_world = M @ src.matrix_world
    if mats: o.data.materials[0] = mats
    return o
def G(x, y, z): return Vector((x, -z, y))  # game -> blender
def wallM(cx, cz, ang, length, sy=1.0, y=0.0):  # ang: rotation (game yaw) so that piece +z (outside) points along n
    return Matrix.Translation(G(cx, y, cz)) @ Matrix.Rotation(ang, 4, 'Z') @ Matrix.Diagonal((length, 1, sy, 1))
paint = tinted(P['k_wall_in'].data.materials[0], WALL); outer = tinted(P['k_wall_out'].data.materials[0], WALL, 0.82)
accent = tinted(P['k_wall_in'].data.materials[0], sys.argv[5] if len(sys.argv) > 5 else '#2D3B63'); doorm = tinted(P['k_door'].data.materials[0], DOOR)
x0, x1, z0, z1 = -2.0, 2.0, -1.8, 1.8
def run(a, b, axis, fixed, n, h, door=None, win=None, acc=False):  # one straight wall between corners, n = outward normal
    L = b - a - 2 * RC; c = (a + b) / 2
    ang = {(0, -1): 0, (0, 1): math.pi, (-1, 0): -math.pi / 2, (1, 0): math.pi / 2}[n]
    cx, cz = (c, fixed) if axis == 'x' else (fixed, c)
    segs = [(a + RC, b - RC)]
    if door is not None: segs = [(a + RC, door - 0.65), (door + 0.65, b - RC)]
    if win is not None:  # wall below the sill and above the lintel, open in between
        segs = [(a + RC, win - 0.66), (win + 0.66, b - RC)]
        px, pz = (win, fixed) if axis == 'x' else (fixed, win)
        for (yy, hh) in ((Y0, 0.94 - Y0), (2.31, h - 2.21)):
            place('k_wall_in', wallM(px, pz, ang, 1.32, hh, yy), accent if acc else paint); place('k_wall_out', wallM(px, pz, ang, 1.32, hh, yy), outer)
        place('k_rim', wallM(px, pz, ang, 1.32, 1, Y0 + h)); place('k_skirt', wallM(px, pz, ang, 1.32, 1, Y0)); place('k_plinth', wallM(px, pz, ang, 1.32, 1, Y0)); place('k_floor_edge', wallM(px, pz, ang, 1.32, 1, Y0))
    for (s0, s1) in segs:
        l = s1 - s0; m = (s0 + s1) / 2; px, pz = (m, fixed) if axis == 'x' else (fixed, m)
        place('k_wall_in', wallM(px, pz, ang, l, h, Y0), accent if acc else paint); place('k_wall_out', wallM(px, pz, ang, l, h, Y0), outer)
        place('k_rim', wallM(px, pz, ang, l, 1, Y0 + h)); place('k_skirt', wallM(px, pz, ang, l, 1, Y0)); place('k_plinth', wallM(px, pz, ang, l, 1, Y0 - 0.0))
        place('k_floor_edge', wallM(px, pz, ang, l, 1, Y0))
    if door is not None:
        px, pz = (door, fixed) if axis == 'x' else (fixed, door); M0 = Matrix.Translation(G(px, 0, pz)) @ Matrix.Rotation(ang, 4, 'Z')
        for k in ('k_doorframe', 'k_door', 'k_door_panel', 'k_door_panel_in', 'k_knob', 'k_knob_in', 'k_doorstep'): place(k, M0, doorm if k.startswith('k_door') and k not in ('k_doorframe', 'k_doorstep') else None)
        # wall above the arch is not needed when the wall is low; for tall walls add a header
        if h > 2.3: place('k_wall_in', wallM(px, pz, ang, 1.3, h - 2.3, Y0 + 2.3), paint)
    if win is not None:
        px, pz = (win, fixed) if axis == 'x' else (fixed, win); M0 = Matrix.Translation(G(px, 0, pz)) @ Matrix.Rotation(ang, 4, 'Z')
        for k in P:
            if k.startswith('k_win'): place(k, M0)
def corner(sx, sz, h, acc=False):
    px, pz = (x0 if sx < 0 else x1), (z0 if sz < 0 else z1); cx, cz = px - sx * RC, pz - sz * RC
    M0 = Matrix.Translation(G(cx, 0, cz)) @ Matrix.Diagonal((sx, sz, 1, 1))  # game z -> blender -y: mirror on blender y by sz handles +z->sz
    for k, y, sy, mm in (('k_c_wall_in', Y0, h, accent if acc else paint), ('k_c_wall_out', Y0, h, outer), ('k_c_rim', Y0 + h, 1, None), ('k_c_skirt', Y0, 1, None), ('k_c_plinth', Y0, 1, None), ('k_c_floor_edge', Y0, 1, None)):
        place(k, Matrix.Translation(G(0, y, 0)) @ M0 @ Matrix.Diagonal((1, 1, sy, 1)), mm)
HB, HF = H, 1.0   # back walls full height, front walls cut down like the game's cutaway
run(x0, x1, 'x', z0, (0, -1), HB, win=-0.6)               # back wall (north), window
run(z0, z1, 'z', x0, (-1, 0), HB, acc=True)               # left wall (west): accent colour like the concept
run(z0, z1, 'z', x1, (1, 0), HF, acc=False)               # right/front
run(x0, x1, 'x', z1, (0, 1), HF, door=-0.9)               # front with the door
corner(-1, -1, HB); corner(1, -1, HB); corner(-1, 1, HF); corner(1, 1, HF)
# the tall west wall ends where the low south wall starts: close it like the game's cutaway does (step down)
# floor: warm wood
bpy.ops.mesh.primitive_plane_add(size=1, location=G(0, Y0 + 0.002, 0)); fl = bpy.context.object; fl.scale = (x1 - x0 - 0.1, z1 - z0 - 0.1, 1)
fm = bpy.data.materials.new('floor'); fm.use_nodes = True; fm.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (*lin('#A8693F'), 1); fl.data.materials.append(fm)
bpy.ops.mesh.primitive_plane_add(size=30, location=(0, 0, 0)); gr = bpy.context.object
gm = bpy.data.materials.new('ground'); gm.use_nodes = True; gm.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (*lin('#EFE3CC'), 1); gr.data.materials.append(gm)
# light + camera (game-like iso)
bpy.ops.object.light_add(type='SUN', location=(4, -3, 8)); s = bpy.context.object; s.data.energy = 3.2; s.data.angle = math.radians(12); s.rotation_euler = (math.radians(42), math.radians(-18), math.radians(35))
w = bpy.data.worlds.new('w'); bpy.context.scene.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs[0].default_value = (*lin('#FFF4E2'), 1); w.node_tree.nodes['Background'].inputs[1].default_value = 0.9
bpy.ops.object.camera_add(); cam = bpy.context.object; cam.data.type = 'ORTHO'; cam.data.ortho_scale = 7.2
yaw, pitch, dist = math.radians(45), math.radians(41), 30
tgt = G(0, 0.9, 0); cam.location = tgt + Vector((dist * math.cos(pitch) * math.sin(yaw), -dist * math.cos(pitch) * math.cos(yaw), dist * math.sin(pitch)))
d = tgt - cam.location; cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler(); bpy.context.scene.camera = cam
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.samples = 48; sc.cycles.device = 'CPU'; sc.render.resolution_x = 1000; sc.render.resolution_y = 800
sc.view_settings.view_transform = 'Standard'; sc.render.filepath = OUTP; bpy.ops.render.render(write_still=True); print('RENDERED', OUTP)
