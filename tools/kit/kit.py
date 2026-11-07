# Interior kit (sheet C 1-4, 9): parametric, clean, rounded, matte. Exports GLB parts + previews + tileable floor textures.
import bpy, bmesh, math, sys, os
OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'out'
C = dict(wall='#A9C29A', cap='#F2E6CC', base='#5F6B66', frame='#F2E6CC', door='#7E9CC0', handle='#C9CDD2', glass='#8DA3BE', mull='#F2E6CC')
H, TH, DOOR_W, DOOR_H = 2.5, 0.3, 1.15, 2.15

def hexrgb(h): h = h.lstrip('#'); return tuple(int(h[i:i+2], 16) / 255 for i in (0, 2, 4))
def srgb2lin(c): return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
MATS = {}
def mat(name, hexc, rough=0.85, alpha=1.0):
    if name in MATS: return MATS[name]
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes['Principled BSDF']
    r, g, bl = (srgb2lin(x) for x in hexrgb(hexc)); b.inputs['Base Color'].default_value = (r, g, bl, 1); b.inputs['Roughness'].default_value = rough
    if alpha < 1: b.inputs['Alpha'].default_value = alpha; m.blend_method = 'BLEND' if hasattr(m, 'blend_method') else None
    MATS[name] = m; return m

def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True); MATS.clear()

def rbox(name, sx, sy, sz, loc, m, bev=0.03, parent=None):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc); o = bpy.context.object; o.name = name; o.scale = (sx, sy, sz)
    bpy.ops.object.transform_apply(scale=True)
    if bev > 0: md = o.modifiers.new('bev', 'BEVEL'); md.width = bev; md.segments = 3; md.limit_method = 'NONE'; bpy.ops.object.modifier_apply(modifier='bev')
    o.data.materials.append(m); bpy.ops.object.shade_smooth() if bev > 0 else None
    if parent: o.parent = parent
    return o

def empty(name, loc=(0, 0, 0)):
    o = bpy.data.objects.new(name, None); bpy.context.scene.collection.objects.link(o); o.location = loc; return o

# Blender is Z-up; glTF export converts to Y-up. Wall runs along X, thickness along Y.
def wall(L=2.0):
    root = empty('wall')
    rbox('w_body', L, TH, H, (0, 0, H / 2), mat('wall', C['wall'], 0.95), 0.04, root)
    rbox('w_cap', L + 0.06, TH + 0.14, 0.12, (0, 0, H + 0.06), mat('cap', C['cap'], 0.9), 0.055, root)   # rounded overhanging cornice
    rbox('w_base', L + 0.02, TH + 0.05, 0.18, (0, 0, 0.09), mat('base', C['base'], 0.9), 0.04, root)    # darker plinth
    return root

def wall_hole(L, hx0, hx1, hz0, hz1):
    root = empty('wallh'); wm = mat('wall', C['wall'], 0.95)
    if hx0 > -L / 2 + 0.01: rbox('wh_l', hx0 + L / 2, TH, H, ((-L / 2 + hx0) / 2, 0, H / 2), wm, 0.04, root)
    if hx1 < L / 2 - 0.01: rbox('wh_r', L / 2 - hx1, TH, H, ((hx1 + L / 2) / 2, 0, H / 2), wm, 0.04, root)
    rbox('wh_top', hx1 - hx0, TH, H - hz1, ((hx0 + hx1) / 2, 0, (H + hz1) / 2), wm, 0.02, root)
    if hz0 > 0.01: rbox('wh_bot', hx1 - hx0, TH, hz0, ((hx0 + hx1) / 2, 0, hz0 / 2), wm, 0.02, root)
    rbox('w_cap', L + 0.06, TH + 0.14, 0.12, (0, 0, H + 0.06), mat('cap', C['cap'], 0.9), 0.055, root)
    for a, b in ((-L / 2, hx0), (hx1, L / 2)) if hz0 < 0.01 else ((-L / 2, L / 2),):
        if b - a > 0.02: rbox('w_base', b - a, TH + 0.05, 0.18, ((a + b) / 2, 0, 0.09), mat('base', C['base'], 0.9), 0.04, root)
    return root

def pillar():
    root = empty('pillar')
    rbox('p_body', 0.36, 0.36, H, (0, 0, H / 2), mat('wall', C['wall'], 0.95), 0.06, root)
    rbox('p_cap', 0.46, 0.46, 0.14, (0, 0, H + 0.07), mat('cap', C['cap'], 0.9), 0.06, root)
    rbox('p_base', 0.4, 0.4, 0.2, (0, 0, 0.1), mat('base', C['base'], 0.9), 0.05, root)
    return root

def door():
    # frame (architrave) + leaf with a hinge pivot (empty 'leaf_pivot' at the hinge, the leaf rotates around Z)
    root = empty('door'); fm = mat('frame', C['frame'], 0.85); fw = 0.12
    for sx in (-1, 1): rbox('d_jamb' + str(sx), fw, TH + 0.08, DOOR_H + fw, (sx * (DOOR_W / 2 + fw / 2), 0, (DOOR_H + fw) / 2), fm, 0.025, root)
    rbox('d_head', DOOR_W + 2 * fw, TH + 0.08, fw, (0, 0, DOOR_H + fw / 2), fm, 0.025, root)
    piv = empty('leaf_pivot', (-DOOR_W / 2, 0, 0)); piv.parent = root
    lw = DOOR_W - 0.04
    leaf = rbox('d_leaf', lw, 0.06, DOOR_H - 0.03, (lw / 2, 0, (DOOR_H - 0.03) / 2 + 0.01), mat('door', C['door'], 0.7), 0.012); leaf.parent = piv
    for py, ph in ((0.62, 0.95), (1.62, 0.8)):  # two raised panels, both faces
        for fy in (-1, 1): p = rbox('d_panel', lw - 0.3, 0.02, ph, (lw / 2, fy * 0.038, py), mat('panel', '#6F8FB6', 0.7), 0.008); p.parent = piv
    for fy in (-1, 1):
        hd = rbox('d_handle', 0.16, 0.035, 0.035, (lw - 0.16, fy * 0.065, 1.0), mat('handle', C['handle'], 0.35), 0.012); hd.parent = piv
        ro = rbox('d_rose', 0.05, 0.02, 0.09, (lw - 0.1, fy * 0.045, 1.0), mat('handle', C['handle'], 0.35), 0.01); ro.parent = piv
    for hz in (0.25, DOOR_H - 0.3): h = rbox('d_hinge', 0.03, 0.08, 0.12, (0.01, 0, hz), mat('handle', C['handle'], 0.35), 0.008); h.parent = piv
    return root

def window(W=1.1, Hh=1.15, sill_z=0.95):
    root = empty('window'); fm = mat('frame', C['frame'], 0.85); fw = 0.09
    for sx in (-1, 1): rbox('wn_side', fw, TH + 0.06, Hh, (sx * (W / 2 + fw / 2), 0, sill_z + Hh / 2), fm, 0.02, root)
    rbox('wn_top', W + 2 * fw, TH + 0.06, fw, (0, 0, sill_z + Hh + fw / 2), fm, 0.02, root)
    rbox('wn_sill', W + 2 * fw + 0.16, TH + 0.2, 0.07, (0, 0.04, sill_z - 0.035), fm, 0.025, root)
    rbox('wn_glass', W, 0.03, Hh, (0, 0, sill_z + Hh / 2), mat('glass', C['glass'], 0.15), 0, root)
    rbox('wn_mv', 0.05, 0.07, Hh, (0, 0, sill_z + Hh / 2), mat('mull', C['mull'], 0.85), 0.01, root)
    rbox('wn_mh', W, 0.07, 0.05, (0, 0, sill_z + Hh / 2), mat('mull', C['mull'], 0.85), 0.01, root)
    return root

def export(root, path):
    bpy.ops.object.select_all(action='DESELECT')
    def sel(o): o.select_set(True); [sel(c) for c in o.children]
    sel(root); bpy.context.view_layer.objects.active = root
    bpy.ops.export_scene.gltf(filepath=path, use_selection=True, export_format='GLB', export_apply=True, export_yup=True)

def studio(target_z=1.2, dist=6.5, ortho=3.4, az=-35, el=18, size=(900, 900)):
    sc = bpy.context.scene; sc.render.engine = 'BLENDER_EEVEE' if 'BLENDER_EEVEE' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE_NEXT'
    sc.render.resolution_x, sc.render.resolution_y = size; sc.render.film_transparent = True
    w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs[0].default_value = (1, 1, 1, 1); w.node_tree.nodes['Background'].inputs[1].default_value = 0.42
    cam = bpy.data.cameras.new('cam'); cam.type = 'ORTHO'; cam.ortho_scale = ortho; co = bpy.data.objects.new('cam', cam); sc.collection.objects.link(co); sc.camera = co
    a, e = math.radians(az), math.radians(el); co.location = (dist * math.sin(a) * math.cos(e) * -1, -dist * math.cos(a) * math.cos(e), target_z + dist * math.sin(e))
    tgt = empty('tgt', (0, 0, target_z)); con = co.constraints.new('TRACK_TO'); con.target = tgt; con.track_axis = 'TRACK_NEGATIVE_Z'; con.up_axis = 'UP_Y'
    sun = bpy.data.lights.new('sun', 'SUN'); sun.energy = 2.4; sun.angle = math.radians(12); so = bpy.data.objects.new('sun', sun); sc.collection.objects.link(so); so.rotation_euler = (math.radians(50), math.radians(10), math.radians(-30))
    try: sc.eevee.use_shadows = True
    except Exception: pass
    sc.view_settings.view_transform = 'Standard'; sc.view_settings.look = 'None'

def render(path): bpy.context.scene.render.filepath = path; bpy.ops.render.render(write_still=True)

os.makedirs(OUT, exist_ok=True)
for name, fn, kw in [('wall', wall, dict(target_z=1.3, ortho=3.6)), ('pillar', pillar, dict(target_z=1.3, ortho=3.4)), ('door', door, dict(target_z=1.3, ortho=3.6)), ('window', window, dict(target_z=1.3, ortho=3.6))]:
    reset(); root = fn(); export(root, f'{OUT}/{name}.glb')
    if name == 'door': wall_hole(2.6, -DOOR_W / 2 - 0.12, DOOR_W / 2 + 0.12, 0, DOOR_H + 0.12)   # preview only: the game builds the wall
    if name == 'window': wall_hole(2.4, -0.64, 0.64, 0.95 - 0.07, 0.95 + 1.15 + 0.09)
    studio(**kw)
    if name == 'door':  # show it slightly open, like in game when someone walks through
        bpy.data.objects['leaf_pivot'].rotation_euler[2] = math.radians(-28)
    render(f'{OUT}/{name}.png')
print('KIT_DONE')
