from lib import D

DIAGRAMS = {}

def reg(key, caption):
    def wrap(fn):
        DIAGRAMS[key] = (fn, caption)
        return fn
    return wrap


# ---------------------------------------------------------------- 00 overview
@reg("overview", "Two ways into the clusters: Ansible builds and bootstraps them; after that, every change flows from Git through the one Argo CD on the hub.")
def overview():
    d = D("ov", 780, 300, "Ansible builds the clusters; Git changes flow through Argo CD on the hub to the worker clusters")
    d.box(20, 125, 90, 50, "You")
    d.box(190, 40, 200, 56, "omarchy-k8s-ansible", "provisioning · private repo")
    d.box(190, 204, 200, 56, "omarchy-k8s-platform", "GitHub · public GitOps repo")
    d.group(470, 16, 290, 268, "Docker on your laptop")
    d.box(490, 46, 250, 82, "mgmt  (hub)", "Argo CD — the only one", accent=True, sub2="+ cert-manager · gateway")
    d.box(490, 200, 110, 62, "dev", "4 apps + gateway")
    d.box(620, 200, 120, 26, "staging (off)", dashed=True, muted=True)
    d.box(620, 236, 120, 26, "prod (off)", dashed=True, muted=True)
    d.arrow([(110, 140), (150, 140), (150, 68), (188, 68)], "make deploy", (150, 128), anchor="middle")
    d.arrow([(110, 160), (150, 160), (150, 232), (188, 232)], "git push", (150, 178))
    d.arrow([(390, 62), (488, 62)], "creates + bootstraps", (440, 54))
    d.arrow([(390, 232), (440, 232), (440, 110), (488, 110)], "pulled every ~3 min", (440, 182), accent=True)
    d.arrow([(545, 128), (545, 198)], "deploys apps", (583, 168))
    d.arrow([(680, 128), (680, 198)], dashed=True, muted=True)
    return d


# ---------------------------------------------------------------- 01 run order
@reg("ansible-run", "One make deploy, in order. Only the highlighted system layer can ask for sudo, and only when a non-root check finds drift. Tags let you run a single stage.")
def ansible_run():
    d = D("ar", 780, 260, "Order of a deploy run; only the system stage may use sudo")
    W, H, Y1, Y2 = 128, 54, 44, 170
    xs = [20, 172, 324, 476, 628]
    row1 = [("prepare", "clone · discover", "always", False),
            ("system", "docker · CA · DNS", "system", True),
            ("tools", "kubectl kind helm", "tools", False),
            ("clusters", "hub + dev (kind)", "cluster", False),
            ("CA → clusters", "lab-ca secret", "ca", False)]
    row2 = [("images", "build · kind load", "images", False),
            ("argocd", "Helm on hub", "argocd", False),
            ("register", "cluster secrets", "clusters", False),
            ("gitops", "root app · wait", "gitops", False),
            ("verify", "HTTPS smoke tests", "verify", False)]
    for row, y in ((row1, Y1), (row2, Y2)):
        for i, (t, s, tag, acc) in enumerate(row):
            d.box(xs[i], y, W, H, t, s, accent=acc)
            d.text(xs[i] + W / 2, y + H + 16, f"tag: {tag}", size=10.5)
            if i < 4:
                d.arrow([(xs[i] + W, y + H / 2), (xs[i + 1] - 2, y + H / 2)])
    d.text(172 + W / 2, Y1 - 10, "sudo only on drift", accent=True, bold=True)
    d.arrow([(692, Y1 + H + 22), (692, 132), (84, 132), (84, Y2 - 2)])
    return d


# ---------------------------------------------------------------- 01 settings flow
@reg("settings-flow", "Every lab-specific value starts in lab.yml. Ansible uses it directly, and passes per-cluster values to the platform repo as Argo CD cluster annotations, so Git never contains the domain.")
def settings_flow():
    d = D("sf", 860, 250, "lab.yml feeds roles.yml and discovery; discovery writes cluster annotations that ApplicationSets read")
    d.group(10, 10, 590, 230, "omarchy-k8s-ansible")
    d.group(620, 10, 230, 230, "hub cluster · platform repo")
    d.box(28, 98, 150, 60, "lab.yml", "the one settings file", accent=True)
    d.box(228, 40, 150, 52, "roles.yml", "derives + maps")
    d.box(228, 164, 150, 52, "discover.yml", "runtime facts")
    d.box(428, 40, 150, 52, "role tasks", "build everything")
    d.box(428, 112, 150, 34, "role defaults", dashed=True, muted=True)
    d.box(428, 164, 150, 52, "argocd_clusters", "registers clusters")
    d.box(640, 164, 190, 52, "cluster secret", "lab/domain: dev.<domain>")
    d.box(640, 40, 190, 52, "ApplicationSets", "<app>.<lab/domain>")
    d.arrow([(178, 118), (203, 118), (203, 66), (226, 66)], "settings", (203, 108))
    d.arrow([(178, 138), (203, 138), (203, 190), (226, 190)])
    d.arrow([(378, 66), (426, 66)], "role vars", (402, 58))
    d.arrow([(503, 112), (503, 94)], dashed=True, muted=True)
    d.text(540, 107, "fallback", size=10.5)
    d.arrow([(378, 190), (426, 190)], "facts", (402, 182))
    d.arrow([(578, 190), (638, 190)], "annotations", (608, 182), accent=True)
    d.arrow([(735, 164), (735, 94)], "read at render", (735, 134), accent=True)
    return d


# ---------------------------------------------------------------- 02 topology
@reg("topology", "Hub and spoke. The hub's Argo CD manages its own add-ons in-cluster and reaches each worker's API server with a per-cluster ServiceAccount token. staging and prod are defined but not enabled.")
def topology():
    d = D("tp", 780, 350, "The hub runs Argo CD and add-ons; Argo CD deploys to the dev worker with a ServiceAccount token")
    def ns_rows(x, y, rows):
        for i, (n, s, acc) in enumerate(rows):
            d.box(x, y + i * 46, 280, 38, n, s, accent=acc)
    d.group(20, 16, 310, 270, "mgmt — hub · 127.0.0.10")
    ns_rows(35, 44, [("argocd", "Argo CD: one UI for every environment", True),
                     ("gateway", "Gateway · argocd.<domain>", False),
                     ("envoy-gateway-system", "Envoy proxy on :80/:443", False),
                     ("cert-manager", "issues certs from lab-ca", False),
                     ("kube-system", "CoreDNS · kindnet · API server", False)])
    d.group(450, 16, 310, 270, "dev — worker · 127.0.0.11")
    ns_rows(465, 44, [("hello-world", "python · dotnet · node · java", True),
                      ("gateway", "Gateway · *.dev.<domain>", False),
                      ("envoy-gateway-system", "Envoy proxy on :80/:443", False),
                      ("cert-manager", "issues certs from lab-ca", False),
                      ("kube-system", "API :6443 · argocd-manager SA", False)])
    d.box(450, 300, 310, 38, "staging · prod", "defined in Git, not enabled", dashed=True, muted=True)
    d.arrow([(315, 63), (390, 63), (390, 247), (463, 247)], accent=True)
    d.text(390, 140, "SA token", accent=True, bold=True)
    d.text(390, 156, "dev-control-plane", accent=True)
    d.text(390, 170, ":6443", accent=True)
    d.arrow([(390, 247), (390, 319), (448, 319)], dashed=True, muted=True)
    d.text(390, 338, "when enabled", size=10.5)
    return d


# ---------------------------------------------------------------- app anatomy + network policy
@reg("app-anatomy", "What one app gets from the web-service chart, and what its NetworkPolicy allows: HTTP in, DNS out, nothing else.")
def app_anatomy():
    d = D("aa", 850, 250, "Gateway routes by host to the app's Service and Pod; the NetworkPolicy allows HTTP in and DNS out only")
    d.group(10, 70, 150, 100, "gateway ns")
    d.box(22, 98, 126, 54, "Gateway", "shared :443")
    d.group(200, 10, 470, 230, "hello-world ns · PSA restricted")
    d.box(216, 98, 140, 54, "HTTPRoute", "python.dev.<domain>")
    d.box(396, 98, 104, 54, "Service", "python :80")
    d.box(534, 98, 120, 54, "Pod", "UID 10001 · RO FS", accent=True)
    d.box(534, 32, 120, 40, "Deployment", "replicas 1 (prod 2)")
    d.box(534, 178, 120, 50, "NetworkPolicy", "in :8080 · out :53")
    d.box(714, 60, 124, 44, "CoreDNS", "kube-system :53")
    d.box(714, 150, 124, 44, "anything else", "internet · pods", dashed=True, muted=True)
    d.arrow([(148, 125), (214, 125)], "by host", (180, 117))
    d.arrow([(356, 125), (394, 125)])
    d.arrow([(500, 125), (532, 125)], ":8080", (516, 117))
    d.arrow([(594, 72), (594, 96)], dashed=True, muted=True)
    d.text(602, 88, "manages", size=10.5, anchor="start")
    d.arrow([(594, 178), (594, 154)], dashed=True, muted=True)
    d.text(602, 170, "guards", size=10.5, anchor="start")
    d.arrow([(654, 112), (690, 112), (690, 82), (712, 82)], "allowed", (690, 72), accent=True)
    d.arrow([(654, 138), (690, 138), (690, 172), (712, 172)], dashed=True, muted=True)
    d.text(690, 192, "✕ blocked", size=11, bold=True)
    return d


# ---------------------------------------------------------------- 03 request path
@reg("request-path", "https://python.dev.<domain>, hop by hop. DNS returns the dev cluster's own loopback IP; kind forwards :443 into the node; Envoy terminates TLS with the wildcard cert and picks the Service from the HTTPRoute. Plain http:// takes the same path via :80 → 31080 and gets a 301 to https.")
def request_path():
    d = D("rp", 1000, 320, "Request path from browser through local DNS, kind port mapping and Envoy to the app pod")
    d.group(10, 10, 360, 300, "your laptop")
    d.group(390, 10, 600, 300, "dev cluster · kind container")
    d.box(30, 50, 140, 50, "systemd-resolved", "127.0.0.53")
    d.box(210, 50, 140, 50, "lab-dns", "dnsmasq 127.0.1.53")
    d.box(30, 200, 140, 54, "Browser", "python.dev.<domain>")
    d.box(210, 200, 140, 54, "127.0.0.11:443", "dev's loopback IP", accent=True)
    d.box(410, 200, 130, 54, "NodePort 31443", "on the node")
    d.box(570, 200, 140, 54, "Envoy proxy", "TLS ends here", accent=True)
    d.box(740, 200, 110, 54, "Service", "python :80")
    d.box(876, 200, 100, 54, "Pod", ":8080")
    d.box(430, 50, 170, 50, "cert *.dev.<domain>", "signed by lab CA")
    d.box(640, 50, 170, 50, "HTTPRoute python", "host → Service python")
    d.arrow([(80, 198), (80, 102)]); d.step(62, 150, 1)
    d.arrow([(170, 75), (208, 75)]); d.step(189, 60, 2)
    d.arrow([(280, 102), (280, 150), (140, 150), (140, 198)], dashed=True); d.step(210, 150, 3)
    d.text(256, 168, "127.0.0.11", size=11)
    d.arrow([(170, 227), (208, 227)], accent=True); d.step(189, 212, 4)
    d.arrow([(350, 227), (408, 227)], accent=True); d.step(379, 212, 5)
    d.arrow([(540, 227), (568, 227)], accent=True); d.step(554, 212, 6)
    d.arrow([(610, 198), (610, 150), (515, 150), (515, 102)], "presents", (562, 142), dashed=True)
    d.arrow([(670, 198), (670, 150), (725, 150), (725, 102)], "matches host", (698, 142), dashed=True)
    d.arrow([(710, 227), (738, 227)], accent=True); d.step(724, 212, 7)
    d.arrow([(850, 227), (874, 227)], accent=True)
    legend = [(30, "1 lookup"), (110, "2 only ~<domain>"), (220, "3 answer"),
              (410, "4 HTTPS to dev's IP"), (560, "5 kind maps :443 → 31443"), (740, "6 TLS + route  ·  7 to the pod")]
    for x, s_ in legend:
        d.text(x, 292, s_, size=10.5, anchor="start", halo=False)
    return d


# ---------------------------------------------------------------- 03 gateway resources
@reg("gateway", "How the Gateway API pieces connect in every cluster. The controller turns the Gateway into Envoy proxy config; cert-manager supplies the certificate; routes attach to a listener.")
def gateway():
    d = D("gw", 880, 370, "Gateway API resources and how they connect")
    d.group(10, 10, 250, 350, "envoy-gateway-system")
    d.box(28, 40, 214, 52, "Envoy Gateway", "controller")
    d.box(28, 150, 214, 58, "Envoy proxy pods", "data plane · serves :80/:443", accent=True)
    d.box(28, 270, 214, 58, "EnvoyProxy envoy", "Service: NodePort 31080/31443")
    d.box(320, 40, 230, 52, "GatewayClass envoy", "controllerName: envoy")
    d.group(305, 112, 260, 248, "gateway ns")
    d.box(320, 136, 230, 128, "")
    d.text(435, 156, "Gateway shared", size=13, muted=False, bold=True, halo=False)
    d.box(336, 168, 198, 38, "listener http :80", "same-ns routes only")
    d.box(336, 214, 198, 42, "listener https :443", "*.dev.<domain>", accent=True)
    d.box(320, 292, 230, 52, "Certificate shared-tls", "cert-manager · lab-ca issuer")
    d.box(626, 168, 240, 40, "HTTPRoute https-redirect", "any http → 301 https")
    d.box(626, 214, 240, 44, "HTTPRoute per app", "hello-world ns · <app>.dev.<domain>")
    d.arrow([(242, 66), (318, 66)], "watches", (280, 58))
    d.arrow([(135, 92), (135, 148)], "programs", (168, 124))
    d.arrow([(135, 270), (135, 210)], "shapes its Service", (172, 244))
    d.arrow([(320, 84), (290, 84), (290, 299), (244, 299)], "parametersRef", (290, 112))
    d.arrow([(435, 292), (435, 258)], "TLS secret", (482, 280), accent=True)
    d.arrow([(624, 188), (536, 188)], "attaches", (580, 180))
    d.arrow([(624, 236), (536, 236)], "attaches", (580, 228), accent=True)
    return d


# ---------------------------------------------------------------- 04 app of apps
@reg("app-of-apps", "Ansible applies one Application, root. Everything below it is generated by Argo CD from Git. Generators are on the arrows; with only dev enabled this makes 12 Applications.")
def app_of_apps():
    d = D("aoa", 900, 400, "root generates projects, an environments ApplicationSet and add-on ApplicationSets, which generate per-cluster applications")
    d.box(345, 16, 210, 56, "root", "applied by Ansible · bootstrap/", accent=True)
    L2 = 140
    d.box(20, L2, 160, 52, "AppProjects", "platform · default · addons")
    d.box(200, L2, 180, 52, "ApplicationSet", "environments")
    d.box(420, L2, 140, 52, "ApplicationSet", "cert-manager")
    d.box(580, L2, 140, 52, "ApplicationSet", "envoy-gateway")
    d.box(740, L2, 140, 52, "ApplicationSet", "gateway")
    for x in (95, 290, 490, 650, 810):
        d.arrow([(450, 72), (450, 104), (x, 104), (x, L2 - 2)])
    L3 = 252
    d.box(200, L3, 180, 52, "env-dev", "syncs environments/dev/")
    for x, n in ((420, "cert-manager-*"), (580, "envoy-gateway-*"), (740, "gateway-*")):
        d.box(x, L3, 140, 52, n, "*-mgmt  ·  *-dev")
        d.arrow([(x + 70, L2 + 52), (x + 70, L3 - 2)])
    d.text(650, 226, "clusters generator: addons=enabled", accent=True)
    d.arrow([(290, L2 + 52), (290, L3 - 2)], "clusters: label environment", (290, 226), accent=True)
    L4 = 340
    d.box(20, L4, 150, 46, "hello-world-dev", "AppProject")
    d.box(200, L4, 180, 46, "hello-world-dev", "ApplicationSet")
    d.box(420, L4, 460, 46, "python-dev · dotnet-dev · node-dev · java-dev", "one Application per apps/hello-world/<app>")
    d.arrow([(250, L3 + 52), (250, 322), (95, 322), (95, L4 - 2)])
    d.arrow([(290, L3 + 52), (290, L4 - 2)])
    d.arrow([(380, 363), (418, 363)], "matrix", (400, 355), accent=True)
    return d


# ---------------------------------------------------------------- 04 change flow
@reg("change-flow", "Two kinds of change. Manifests and values go through Git and Argo CD. App code also needs a new image, which Ansible builds and loads; pods restart without touching Git.")
def change_flow():
    d = D("cf", 960, 240, "Config changes flow through Git and Argo CD; code changes are rebuilt and loaded by Ansible")
    d.text(20, 30, "CONFIG CHANGE", size=10.5, anchor="start", bold=True, halo=False)
    d.box(20, 44, 130, 50, "edit values", "or manifests")
    d.box(214, 44, 130, 50, "GitHub", "git push")
    d.box(420, 44, 170, 50, "Argo CD", "render Helm · diff", accent=True)
    d.box(650, 44, 130, 50, "dev cluster", "apply · prune")
    d.box(830, 44, 110, 50, "Healthy", "in Argo CD UI")
    d.arrow([(150, 69), (212, 69)], "git push", (181, 61))
    d.arrow([(344, 69), (418, 69)], "polled ~3 min", (381, 61), accent=True)
    d.arrow([(590, 69), (648, 69)], "sync", (619, 61), accent=True)
    d.arrow([(780, 69), (828, 69)])
    d.arrow([(715, 94), (715, 116), (505, 116), (505, 96)], "self-heal reverts manual drift", (610, 132), dashed=True)
    d.text(20, 170, "CODE CHANGE", size=10.5, anchor="start", bold=True, halo=False)
    d.box(20, 184, 130, 50, "edit src/", "app code")
    d.box(214, 184, 170, 50, "make images", "Ansible app_images")
    d.box(444, 184, 180, 50, "build + kind load", "only if digest differs")
    d.box(684, 184, 170, 50, "pods restart", "Deployment untouched")
    d.arrow([(150, 209), (212, 209)])
    d.arrow([(384, 209), (442, 209)])
    d.arrow([(624, 209), (682, 209)])
    return d


# ---------------------------------------------------------------- 05 DNS split
@reg("dns", "systemd-resolved splits lookups by name. Only the lab domain goes to lab-dns, which answers from wildcard records and never forwards; everything else uses your normal DNS.")
def dns():
    d = D("dn", 840, 230, "Only lab-domain lookups go to lab-dns; everything else uses the normal resolver")
    d.box(20, 90, 130, 50, "any program", "browser · curl")
    d.box(200, 90, 160, 50, "systemd-resolved", "127.0.0.53 stub")
    d.box(420, 20, 160, 50, "lab-dns", "dnsmasq 127.0.1.53", accent=True)
    d.box(420, 160, 160, 50, "Wi-Fi DNS", "unchanged")
    d.box(620, 10, 200, 110, "")
    rows = [("<domain>", "127.0.0.10 hub"), ("dev.<domain>", "127.0.0.11"), ("staging.<domain>", "127.0.0.12"), ("prod.<domain>", "127.0.0.13")]
    for i, (n, ip) in enumerate(rows):
        d.text(632, 36 + i * 24, n, size=11.5, anchor="start", muted=False, halo=False)
        d.text(808, 36 + i * 24, ip, size=11.5, anchor="end", halo=False)
    d.text(720, 138, "wildcards: any name under each", size=10.5)
    d.arrow([(150, 115), (198, 115)])
    d.arrow([(360, 105), (390, 105), (390, 45), (418, 45)], "*.<domain>", (390, 85), accent=True)
    d.arrow([(360, 125), (390, 125), (390, 185), (418, 185)], "everything else", (390, 152))
    d.arrow([(580, 45), (618, 45)], accent=True)
    return d


# ---------------------------------------------------------------- 05 trust chain
@reg("trust", "Why the padlock is green. One CA, two copies: the certificate is trusted on your laptop, and the key signs certificates inside each cluster. The browser checks the served certificate against the CA it trusts.")
def trust():
    d = D("tr", 900, 290, "The lab CA is trusted locally and signs gateway certificates in each cluster; the browser verifies one against the other")
    d.box(20, 115, 170, 60, "lab CA", "name-constrained to <domain>", accent=True)
    d.group(230, 10, 430, 110, "your laptop")
    d.box(250, 44, 180, 54, "OS trust store", "curl, tools")
    d.box(460, 44, 180, 54, "Chromium NSS db", "~/.pki/nssdb")
    d.group(230, 160, 430, 120, "each cluster")
    d.box(250, 196, 120, 60, "lab-ca secret", "cert-manager ns")
    d.box(390, 196, 120, 60, "ClusterIssuer", "signs with lab-ca")
    d.box(530, 196, 120, 60, "Certificate", "*.dev.<domain>")
    d.box(720, 196, 160, 60, "Gateway :443", "serves the cert")
    d.box(720, 44, 160, 54, "Browser", "✓ issued by trusted CA", accent=True)
    d.arrow([(105, 115), (105, 71), (228, 71)], "cert installed", (160, 62), accent=True)
    d.arrow([(105, 175), (105, 226), (228, 226)], "key + cert, by Ansible", (165, 246))
    d.arrow([(370, 226), (388, 226)])
    d.arrow([(510, 226), (528, 226)])
    d.arrow([(650, 226), (718, 226)])
    d.arrow([(660, 71), (718, 71)], "trusts", (689, 63), accent=True)
    d.arrow([(800, 196), (800, 100)], "TLS handshake", (800, 152), accent=True)
    return d


# ---------------------------------------------------------------- 06 security layers
@reg("security", "Defence in depth. Each layer stops something the one outside it doesn't: the machine limits what the CA and DNS can touch, Argo CD projects limit what Git can deploy, the namespace rejects unhardened pods, and the pod itself runs with nothing it doesn't need.")
def security():
    d = D("sc", 860, 330, "Nested security layers from machine to pod")
    layers = [
        (10, 10, 840, 310, "Machine", "CA name-constrained · DNS answers lab domain only · sudo only on drift · secrets 0600, never in Git"),
        (40, 66, 780, 244, "Argo CD projects", "default emptied · platform: projects + appsets only · <group>-<env>: 1 repo, 1 ns, 1 cluster, 5 kinds"),
        (70, 122, 720, 178, "Namespace", "Pod Security restricted · NetworkPolicy: HTTP in, DNS out · HTTPS only, HTTP redirects"),
    ]
    for x, y, w, h, t, s in layers:
        d.group(x, y, w, h, t)
        d.text(x + 14, y + 38, s, size=11.5, anchor="start", halo=False)
    d.box(100, 190, 660, 96, "Pod", "non-root UID 10001 · read-only root FS · all capabilities dropped", accent=True,
          sub2="no privilege escalation · seccomp RuntimeDefault · no ServiceAccount token")
    return d


# ---------------------------------------------------------------- 07 troubleshooting
@reg("troubleshoot", "Start at the top and follow the first check that fails. Each check is one command; the fix is in the box it leads to.")
def troubleshoot():
    d = D("ts", 900, 400, "Troubleshooting decision tree for an app URL that does not work")
    d.box(330, 14, 240, 44, "https://app.env.<domain> fails", accent=True)
    d.box(330, 92, 240, 50, "resolves to 127.0.0.x?", "resolvectl query <name>")
    d.box(630, 92, 250, 50, "fix DNS", "systemctl status lab-dns · --tags dns")
    d.box(330, 176, 240, 50, "what does curl -v say?", "curl -v https://<name>")
    d.box(20, 270, 250, 50, "certificate error", "--tags ca · restart browser")
    d.box(330, 270, 240, 50, "connection refused", "docker ps: cluster running?")
    d.box(630, 270, 250, 50, "404 / no route", "kubectl get httproute · Argo CD")
    d.box(200, 350, 200, 40, "not running → make deploy")
    d.box(430, 350, 290, 40, "running → kubectl get gateway,cert")
    d.arrow([(450, 58), (450, 90)])
    d.arrow([(570, 117), (628, 117)], "no", (599, 109))
    d.arrow([(450, 142), (450, 174)], "yes", (466, 162), anchor="start")
    d.arrow([(450, 226), (450, 248), (145, 248), (145, 268)])
    d.arrow([(450, 248), (450, 268)])
    d.arrow([(450, 248), (755, 248), (755, 268)])
    d.arrow([(400, 320), (400, 335), (300, 335), (300, 348)])
    d.arrow([(500, 320), (500, 335), (575, 335), (575, 348)])
    return d
