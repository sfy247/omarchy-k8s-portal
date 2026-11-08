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
    d.box(490, 46, 250, 82, "mgmt  (hub)", "Argo CD — the only one", accent=True, sub2="portal · observability · gateway")
    d.box(490, 200, 110, 62, "dev", "your services")
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
    d.box(534, 32, 120, 40, "Deployment", "1 replica (prod 2)")
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
    d.box(20, L2, 160, 52, "AppProjects", "platform · addons")
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
    d = D("cf", 960, 240, "Config changes flow through Git and Argo CD; code changes are built by CI, which commits the new image tag to Git")
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
    d.text(20, 170, "CODE CHANGE (a service)", size=10.5, anchor="start", bold=True, halo=False)
    d.box(20, 184, 130, 50, "push to main", "service repo")
    d.box(214, 184, 170, 50, "CI", "build · contract · scan")
    d.box(444, 184, 180, 50, "deploy-dev", "commits the image tag", accent=True)
    d.box(684, 184, 170, 50, "platform repo", "then config path above")
    d.arrow([(150, 209), (212, 209)])
    d.arrow([(384, 209), (442, 209)], "image to GHCR", (413, 201))
    d.arrow([(624, 209), (682, 209)], accent=True)
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
    d.box(20, 115, 170, 60, "lab CA", "only <domain> names", accent=True)
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


# ---------------------------------------------------------------- guides: the whole path
@reg("lifecycle", "The whole path. You work in the portal and your repo; CI builds and checks the image, then deploys it by committing its tag to the platform repo; Argo CD makes the cluster match Git; Operate and Grafana show how it's running.")
def lifecycle():
    d = D("lc", 960, 300, "Create a service in the portal, push code, CI builds and deploys by Git, Argo CD rolls out, Operate and Grafana show health")
    d.box(20, 120, 100, 56, "You")
    d.group(150, 16, 190, 268, "Portal")
    d.box(170, 46, 150, 50, "Create", "template · repo · PR")
    d.box(170, 124, 150, 50, "Discover · Learn", "catalog · docs · CI/CD")
    d.box(170, 202, 150, 50, "Operate", "deploys · health · logs", accent=True)
    d.box(390, 46, 160, 50, "service repo", "your code · Dockerfile")
    d.box(390, 124, 160, 50, "CI", "build · contract · scan")
    d.box(600, 124, 150, 50, "platform repo", "values per environment")
    d.box(800, 46, 140, 50, "GHCR", "sha-<commit> images")
    d.box(800, 124, 140, 50, "Argo CD", "syncs Git → cluster", accent=True)
    d.box(800, 202, 140, 50, "dev cluster", "your service", accent=True)
    d.box(600, 202, 150, 50, "Grafana", "metrics · logs · alerts")
    d.arrow([(120, 136), (135, 136), (135, 71), (168, 71)])
    d.arrow([(120, 160), (135, 160), (135, 227), (168, 227)])
    d.arrow([(320, 71), (388, 71)], "creates", (354, 63))
    d.arrow([(470, 96), (470, 122)], "push", (490, 113), anchor="start")
    d.arrow([(550, 136), (575, 136), (575, 60), (798, 60)], "image", (690, 52))
    d.arrow([(550, 156), (598, 156)], "commits tag", (574, 190), accent=True)
    d.arrow([(750, 149), (798, 149)], "~3 min", (774, 141), accent=True)
    d.arrow([(870, 174), (870, 200)], "rolls out", (880, 191), anchor="start", accent=True)
    d.arrow([(798, 240), (752, 240)], "telemetry", (775, 263))
    d.arrow([(598, 227), (322, 227)], "health · logs", (460, 219))
    return d


# ---------------------------------------------------------------- 09 developer portal
@reg("portal", "The portal is one Backstage backend plus the app. It reads the catalog from Git, writes only through GitHub (repos, pull requests) and Argo CD's restart action, and reads everything else.")
def portal():
    d = D("pt", 960, 330, "Browser to gateway to Backstage; Backstage reads GitHub, Argo CD, Prometheus, Loki, Alertmanager and its Postgres")
    d.box(20, 140, 100, 50, "Browser", "GitHub sign-in")
    d.box(150, 140, 110, 50, "Gateway", "HTTPS · hub")
    d.group(290, 16, 340, 298, "Backstage (developer-portal namespace)", accent=True)
    d.box(310, 46, 145, 50, "catalog", "entities from Git")
    d.box(465, 46, 145, 50, "scaffolder", "templates · actions")
    d.box(310, 108, 145, 50, "techdocs", "Learn")
    d.box(465, 108, 145, 50, "operate", "/api/operate", accent=True)
    d.box(310, 170, 145, 50, "permission", "ownership policy")
    d.box(465, 170, 145, 50, "auth", "GitHub · tokens")
    d.box(310, 240, 300, 50, "Postgres (CloudNativePG)", "catalog · tasks · search")
    d.box(690, 30, 250, 50, "GitHub", "repos · PRs · Actions runs")
    d.box(690, 100, 250, 50, "Argo CD API", "apps · history · restart only")
    d.box(690, 170, 250, 50, "Prometheus · Loki · Alertmanager", "health · logs · alerts")
    d.box(690, 250, 250, 50, "Ansible", "config + secrets (ConfigMap, Secret)", dashed=True)
    d.arrow([(120, 165), (148, 165)])
    d.arrow([(260, 165), (288, 165)])
    d.arrow([(612, 55), (688, 55)], "read · create", (650, 47))
    d.arrow([(612, 125), (688, 125)], "read · restart", (650, 117), accent=True)
    d.arrow([(612, 195), (688, 195)], "read", (650, 187))
    d.arrow([(688, 275), (612, 275)], "at deploy", (650, 267), dashed=True)
    return d


# ---------------------------------------------------------------- 10 observability
@reg("observability", "Every cluster runs the same agents; they push metrics, logs and events to the hub over mutual TLS. The hub stores and alerts; Grafana and the portal read from it.")
def observability():
    d = D("ob", 960, 320, "Alloy agents in each cluster push over mTLS to the hub's Prometheus and Loki; Grafana, Alertmanager and the portal read them")
    d.group(20, 16, 330, 288, "Each cluster (dev, hub)")
    d.box(40, 46, 140, 50, "your pods", "/metrics · stdout")
    d.box(40, 120, 140, 50, "exporters", "kube-state · node")
    d.box(40, 194, 140, 50, "Kubernetes", "events")
    d.box(210, 46, 120, 70, "alloy-metrics", "scrapes", sub2="PodMonitors")
    d.box(210, 150, 120, 70, "alloy-logs", "tails pods", sub2="JSON level")
    d.arrow([(180, 71), (208, 71)])
    d.arrow([(180, 145), (195, 145), (195, 90), (208, 90)])
    d.arrow([(180, 219), (195, 219), (195, 112), (208, 112)], dashed=True)
    d.arrow([(110, 96), (110, 108), (195, 108), (195, 185), (208, 185)], dashed=True, head=True)
    d.box(400, 100, 140, 70, "ingest :9443", "gateway listener", sub2="client certs only", accent=True)
    d.arrow([(330, 81), (365, 81), (365, 125), (398, 125)], "metrics", (365, 70))
    d.arrow([(330, 185), (365, 185), (365, 150), (398, 150)], "logs", (365, 204))
    d.group(580, 16, 360, 288, "Hub: observability namespace", accent=True)
    d.box(600, 46, 150, 50, "Prometheus", "7 days · rules")
    d.box(600, 140, 150, 50, "Loki", "7 days · logs, events")
    d.box(780, 46, 140, 50, "Alertmanager", "alerts")
    d.box(780, 140, 140, 50, "Grafana", "dashboards", accent=True)
    d.box(690, 234, 160, 50, "portal Operate", "health · logs")
    d.arrow([(540, 120), (570, 120), (570, 71), (598, 71)], "remote write", (570, 60), accent=True)
    d.arrow([(540, 150), (570, 150), (570, 165), (598, 165)], "push", (575, 182), accent=True)
    d.arrow([(750, 71), (778, 71)])
    d.arrow([(750, 165), (778, 165)])
    d.arrow([(675, 190), (675, 210), (740, 210), (740, 232)], dashed=True)
    return d


# ---------------------------------------------------------------- 11 delivery
@reg("delivery", "Deploy by Git. CI builds the image and checks it against the Service Contract; only then is it published and its tag committed to the platform repo, which Argo CD applies. Rolling back is reverting that commit.")
def delivery():
    d = D("dl", 980, 250, "Push to main runs CI: build, Service Contract check, scan, push to GHCR, then deploy-dev commits the tag to the platform repo and Argo CD rolls it out")
    d.box(20, 90, 110, 56, "push", "to main")
    d.group(160, 16, 470, 218, "CI: your repo's workflow (shared pipeline)")
    d.box(180, 46, 130, 50, "build + test", "per language")
    d.box(330, 46, 130, 50, "image", "your Dockerfile")
    d.box(480, 46, 130, 50, "contract", "runs it like k8s", accent=True)
    d.box(330, 150, 130, 56, "scan", "critical CVE = stop")
    d.box(480, 150, 130, 56, "push", "ghcr.io/…:sha-<sha>")
    d.box(660, 150, 140, 56, "deploy-dev", "GitOps app commits", accent=True)
    d.box(660, 46, 140, 50, "platform repo", "values-dev.yaml tag")
    d.box(830, 46, 130, 50, "Argo CD", "polls ~3 min", accent=True)
    d.box(830, 150, 130, 56, "dev", "rolling update")
    d.arrow([(130, 118), (150, 118), (150, 71), (178, 71)])
    d.arrow([(310, 71), (328, 71)])
    d.arrow([(460, 71), (478, 71)])
    d.arrow([(545, 96), (545, 120), (395, 120), (395, 148)], "pass", (470, 114))
    d.arrow([(460, 178), (478, 178)])
    d.arrow([(610, 178), (658, 178)])
    d.arrow([(730, 150), (730, 98)], "commit", (740, 128), anchor="start", accent=True)
    d.arrow([(800, 71), (828, 71)], accent=True)
    d.arrow([(895, 96), (895, 148)], "sync", (905, 126), anchor="start", accent=True)
    return d


# ---------------------------------------------------------------- 12 golden paths
@reg("golden-paths", "A template owns only its code. Every stage after it comes from shared building blocks, so a new language is a skeleton plus a build-and-test workflow.")
def golden_paths():
    d = D("gp", 900, 260, "Language templates provide a skeleton and a build workflow; shared blocks provide CI/CD, infrastructure and deployment")
    d.text(20, 30, "PER LANGUAGE", size=10.5, anchor="start", bold=True, halo=False)
    d.box(20, 44, 190, 56, ".NET web service", "skeleton + .NET CI")
    d.box(230, 44, 190, 56, "Bring your own container", "starter/ or your repo")
    d.box(440, 44, 190, 56, "next: Python, Node…", "skeleton + <lang> CI", dashed=True)
    d.text(20, 140, "SHARED (templates/_shared, .github/)", size=10.5, anchor="start", bold=True, halo=False)
    d.box(20, 154, 160, 56, "cicd/repo", "ci.yaml caller")
    d.box(200, 154, 190, 56, "container-service.yaml", "contract · scan · deploy", accent=True)
    d.box(410, 154, 140, 56, "infra/", "values.yaml")
    d.box(570, 154, 140, 56, "deploy/", "values-<env>.yaml")
    d.box(730, 154, 150, 56, "Service Contract", "check.sh", accent=True)
    d.arrow([(115, 100), (115, 152)])
    d.arrow([(325, 100), (325, 128), (295, 128), (295, 152)])
    d.arrow([(535, 100), (535, 128), (480, 128), (480, 152)], dashed=True)
    d.arrow([(390, 182), (408, 182)], muted=True, head=False)
    d.arrow([(390, 200), (740, 230), (805, 212)], muted=True, head=False, dashed=True)
    return d


# ---------------------------------------------------------------- 13 databases: trust
@reg("db-trust", "One private CA, used only by Postgres. It signs the server's certificate and one client certificate per service. Each side verifies the other against the same CA, and Postgres also checks that the certificate's name is the login's name.")
def db_trust():
    d = D("dt", 900, 300, "The Postgres CA in cert-manager signs the Postgres server certificate and each service's client certificate; both sides verify each other")
    d.box(330, 20, 240, 60, "Postgres CA", "ClusterIssuer postgres · cert-manager", accent=True)
    d.group(20, 120, 360, 164, "Your service's namespace")
    d.box(40, 152, 150, 56, "client certificate", "CN = services_orders")
    d.box(210, 152, 150, 56, "your pod", "/etc/postgres-client")
    d.box(40, 222, 320, 44, "Secret <name>-db-cert", "tls.crt · tls.key · ca.crt")
    d.group(520, 120, 360, 164, "postgres namespace")
    d.box(540, 152, 150, 56, "Postgres", "hostssl … cert", accent=True)
    d.box(710, 152, 150, 56, "server certificate", "postgres-rw…svc")
    d.box(540, 222, 320, 44, "role + database services_orders", "DatabaseRole · Database (retain)")
    d.arrow([(380, 80), (380, 100), (115, 100), (115, 150)], "signs", (250, 94))
    d.arrow([(570, 80), (570, 100), (785, 100), (785, 150)], "signs", (680, 94))
    d.arrow([(190, 180), (208, 180)])
    d.arrow([(360, 170), (538, 170)], "TLS 1.3 · client cert", (449, 162), accent=True)
    d.arrow([(708, 180), (692, 180)], muted=True)
    d.arrow([(538, 192), (362, 192)], "server cert · verify-full", (449, 212), accent=True)
    return d


# ---------------------------------------------------------------- 13 databases: lifecycle
@reg("db-lifecycle", "From request to connected, with nobody in the loop. Merging the pull request is the only human step; Argo CD, cert-manager and CloudNativePG do the rest in a few minutes.")
def db_lifecycle():
    d = D("dlc", 980, 250, "Add a database opens a PR; on merge Argo CD applies the chart, cert-manager issues the certificate, CloudNativePG creates the role and database, the pod restarts and connects")
    d.box(20, 40, 140, 56, "Add a database", "Operate or Create")
    d.box(200, 40, 140, 56, "pull request", "database.enabled")
    d.box(380, 40, 140, 56, "Argo CD", "web-service chart", accent=True)
    d.box(570, 10, 180, 50, "cert-manager", "issues the certificate")
    d.box(570, 80, 180, 50, "CloudNativePG", "creates role + database")
    d.box(800, 40, 160, 56, "your pod", "restarts · connects", accent=True)
    d.arrow([(160, 68), (198, 68)])
    d.arrow([(340, 68), (378, 68)], "merge", (359, 60), accent=True)
    d.arrow([(520, 60), (545, 60), (545, 35), (568, 35)], "Certificate", (520, 24), anchor="start")
    d.arrow([(520, 76), (545, 76), (545, 105), (568, 105)], "DatabaseRole · Database", (570, 146), anchor="start")
    d.arrow([(750, 35), (775, 35), (775, 60), (798, 60)])
    d.arrow([(750, 105), (775, 105), (775, 76), (798, 76)])
    d.text(20, 170, "WHAT EACH PIECE IS", size=10.5, anchor="start", bold=True, halo=False)
    d.box(20, 184, 220, 50, "Certificate", "your namespace · CN = role")
    d.box(260, 184, 220, 50, "DatabaseRole", "login, certificate only")
    d.box(500, 184, 220, 50, "Database", "owned by that role")
    d.box(740, 184, 220, 50, "PG* settings", "env vars + mounted files")
    return d


# ---------------------------------------------------------------- 13 databases: login check
@reg("db-login", "What happens on every connection. Any failed check ends it: no certificate, a certificate from another CA, a name that isn't the login, or no TLS.")
def db_login():
    d = D("dlg", 940, 210, "Connection checks: TLS, server certificate verified by the app, client certificate verified by Postgres, certificate name equals login, then the role's own database")
    xs = [20, 205, 390, 575, 760]
    steps = [("TLS required", "plaintext rejected"), ("app checks server", "CA + hostname"),
             ("checks client", "Postgres CA signed"), ("name = login?", "CN services_orders"),
             ("its own database", "owner of one database")]
    for i, (x, (t, s)) in enumerate(zip(xs, steps)):
        d.box(x, 60, 160, 60, t, s, accent=(i == 3))
        d.step(x + 12, 52, i + 1)
        if i:
            d.arrow([(x - 25, 90), (x - 2, 90)], accent=True)
    d.text(20, 160, "Fails: no TLS · fake server · no or foreign certificate · someone else's certificate · another service's database", size=11, anchor="start", halo=False)
    return d
