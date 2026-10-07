/**
 * Stylesheet for the Voyage template. One string shared by the in-app preview
 * (injected through a <style> tag) and the published static site, so both render
 * the same. Fonts come in as --vg-display / --vg-body (next/font in the preview,
 * Google Fonts in the static site). Text sizes follow the approved scale: body
 * 15-18px, headings 18px; only the decorative hero/tagline titles are larger.
 */
export const VOYAGE_CSS = `
.vg-root{--vg-accent:#F28C51;--vg-glass:linear-gradient(180deg,rgba(14,8,26,.62),rgba(14,8,26,.5));position:relative;background:#05030c;color:#fff;font-family:var(--vg-body,"Manrope",system-ui,sans-serif);min-height:100vh;overflow-x:clip;-webkit-font-smoothing:antialiased}
.vg-root *{box-sizing:border-box}
.vg-root button{font:inherit;color:inherit;cursor:pointer}
.vg-root img{-webkit-user-drag:none;user-select:none}

/* ---- backdrop: stacked skies, only the active one is visible */
.vg-backdrop{position:fixed;inset:0;z-index:0;overflow:hidden;background:#05030c}
.vg-sky{position:absolute;inset:0;opacity:0;transition:opacity .9s ease}
.vg-sky.on{opacity:1}
.vg-sky-grad{position:absolute;inset:0}
.vg-sky-layers{position:absolute;inset:-30px -60px -40px -60px}
.vg-sky-layers img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.vg-sky-twinkle{animation:vg-twinkle 8s ease-in-out infinite}
.vg-sky-dim{position:absolute;inset:0;pointer-events:none}
@keyframes vg-twinkle{0%,100%{opacity:.5}50%{opacity:1}}

/* ---- chapter select */
.vg-select-fg{position:fixed;inset:0;z-index:2;overflow:hidden;pointer-events:none}
.vg-marquee{position:absolute;left:0;right:0;top:22%;overflow:hidden;white-space:nowrap;opacity:.8;animation:vg-fade .8s ease both}
.vg-marquee-inner{display:inline-flex;width:max-content;animation:vg-marquee 40s linear infinite}
.vg-marquee span{font-family:var(--vg-display,"Unbounded",sans-serif);font-weight:800;text-transform:uppercase;font-size:clamp(96px,20vw,280px);line-height:1;color:transparent;-webkit-text-stroke:2px rgba(255,255,255,.85);padding-right:.45em}
@keyframes vg-marquee{to{transform:translateX(-50%)}}
@keyframes vg-fade{from{opacity:0}}
.vg-planet{--pw:min(132vmin,1500px);position:absolute;left:50%;bottom:calc(var(--pw) * -.65);width:var(--pw);aspect-ratio:1;translate:-50% 0;opacity:0;transition:opacity .7s ease,transform .9s cubic-bezier(.62,.05,.01,.99)}
.vg-planet img{display:block;width:100%;height:100%;rotate:var(--r,0deg);animation:vg-spin 250s linear infinite;transition:rotate .9s cubic-bezier(.62,.05,.01,.99)}
.vg-planet[data-pos=on]{opacity:1;transform:none}
.vg-planet[data-pos=next]{transform:translateX(48vw) rotate(14deg)}
.vg-planet[data-pos=prev]{transform:translateX(-48vw) rotate(-14deg)}
@keyframes vg-spin{to{transform:rotate(-360deg)}}
.vg-rocks{position:absolute;left:0;right:0;top:2%;height:38%;opacity:.4;animation:vg-drift 18s ease-in-out infinite alternate}
.vg-rocks img{width:100%;height:100%;object-fit:contain}
@keyframes vg-drift{from{transform:translate3d(-1.5%,0,0)}to{transform:translate3d(1.5%,2%,0)}}
.vg-select-card{position:absolute;left:50%;top:46%;translate:-50% 0;width:min(520px,calc(100% - 40px));text-align:center;pointer-events:auto;display:flex;flex-direction:column;align-items:center;gap:12px}
.vg-kicker{font-size:13px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--vg-accent)}
.vg-select-card h2{margin:0;font-size:18px;line-height:1.3;font-weight:700}
.vg-meta{font-size:13px;letter-spacing:.06em;opacity:.7;text-transform:uppercase}
.vg-btn{position:relative;margin-top:6px;padding:13px 26px;border:1px solid var(--vg-accent);background:rgba(10,6,20,.55);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);color:#fff;font-size:14px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;clip-path:polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,12px 100%,0 calc(100% - 12px));transition:background .3s,color .3s}
.vg-btn:hover{background:var(--vg-accent);color:#0a0614}
.vg-btn:focus-visible{outline:2px solid #fff;outline-offset:2px}

/* ---- chunk page */
.vg-art{position:fixed;inset:0;z-index:1;pointer-events:none;overflow:hidden}
.vg-art-layer{position:absolute;will-change:transform}
.vg-art-layer img{display:block;width:100%;height:auto}
.vg-art-planet{right:-6%;top:-14%;width:min(78vh,62vw)}
.vg-art-prop{left:6%;top:24%;width:min(24vh,26vw)}
.vg-art-prop img{animation:vg-bob 7s ease-in-out infinite}
.vg-art-floor{left:-15%;width:130%;bottom:-18vh}
@keyframes vg-bob{0%,100%{translate:0 0;rotate:0deg}50%{translate:0 -2.5%;rotate:-3deg}}
.vg-tagline{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:0 6vw}
.vg-tagline h2{margin:0;font-family:var(--vg-display,"Unbounded",sans-serif);font-weight:800;text-transform:uppercase;text-align:center;max-width:18ch;font-size:clamp(1.5rem,4.2vw,3.25rem);line-height:1.08;text-wrap:balance}
.vg-mask{display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.08em}
.vg-mask>span{display:inline-block}
.vg-page{position:relative;z-index:3}
.vg-hero-title{will-change:transform}
.vg-hero{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:0 4vw}
.vg-stage{position:relative;display:flex;flex-direction:column;align-items:center;max-width:96vw}
.vg-hero-row{align-self:stretch;display:flex;justify-content:space-between;padding:0 .5vw 10px;font-size:14px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
.vg-hero-title{margin:0;font-family:var(--vg-display,"Unbounded",sans-serif);font-weight:800;text-transform:uppercase;text-align:center;line-height:.95;color:var(--vg-accent);text-wrap:balance;overflow-wrap:anywhere}
.vg-video{position:absolute;left:50%;top:50%;translate:-50% -56%;width:clamp(240px,34vw,560px);pointer-events:none}
.vg-video video,.vg-video img{display:block;width:100%;height:auto;animation:vg-tilt 6s ease-in-out infinite;filter:drop-shadow(0 18px 14px rgba(0,0,0,.28))}
.vg-video-scene{width:clamp(280px,46vw,720px)}
.vg-video-scene img{border-radius:18px;aspect-ratio:16/9;object-fit:cover}
@keyframes vg-tilt{0%,100%{rotate:0deg}50%{rotate:-2.5deg}}
.vg-gap{height:100vh}
.vg-info{display:block;padding:0 20px 40px}
.vg-info .cl-panel{backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px)}
.vg-root .cl-pill{color:var(--cl-pill-text);font-size:.8125rem;font-weight:500}
.vg-cards{width:100%;max-width:1120px;margin:0 auto;display:grid;grid-template-columns:1fr;gap:28px;align-items:end}
@media(min-width:900px){.vg-cards{grid-template-columns:1fr 1fr;gap:40px}}
.vg-end{min-height:60vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:0 20px 150px;text-align:center}
.vg-end p{margin:0;font-size:15px;opacity:.75;max-width:40ch}
.vg-next{position:relative;overflow:hidden}
.vg-next-bar{position:absolute;left:0;top:0;bottom:0;width:calc(var(--vg-down,0) * 1%);background:var(--vg-accent);opacity:.35;pointer-events:none}

/* ---- cards (clip-path geometry) */
.vg-card{position:relative;width:100%;max-width:560px;margin:0 auto}
@media(min-width:900px){.vg-card{margin:0}.vg-card.mirror{margin-left:auto}}
.vg-card-edge{position:absolute;inset:0;z-index:0;background:var(--vg-accent);clip-path:polygon(0px 30px,0px calc(100% - 61px),53px calc(100% - 0px),calc(100% - 0px) calc(100% - 0px),calc(100% - 0px) 62px,175px 62px,144px 30px,0px 30px,144px 31px,175px 63px,calc(100% - 1px) 63px,calc(100% - 1px) calc(100% - 1px),53px calc(100% - 1px),1px calc(100% - 61px),1px 31px,144px 31px)}
.vg-card-tab{position:absolute;z-index:3;top:0;left:0;right:0;height:62px;margin:0;display:flex;align-items:center;justify-content:flex-end;background:var(--vg-glass);backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px);clip-path:polygon(144px 0,144px 30px,176px 100%,100% 100%,100% 0%);border-right:1px solid var(--vg-accent);border-top:1px solid var(--vg-accent);font-size:13px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;line-height:1}
.vg-card-tab::before{content:"";position:absolute;top:0;left:144px;width:1px;height:30px;background:var(--vg-accent)}
.vg-card-tab span{display:inline-block;text-align:center;width:calc(100% - 144px)}
.vg-card-body{position:relative;z-index:1;isolation:isolate;padding:94px 34px 74px;background:var(--vg-glass);backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px);clip-path:polygon(10px 40px,10px calc(100% - 66px),58px calc(100% - 10px),calc(100% - 10px) calc(100% - 10px),calc(100% - 10px) 72px,171px 72px,139px 40px);user-select:text}
.vg-card-body::after{content:"";position:absolute;inset:0;z-index:2;pointer-events:none;background:var(--vg-accent);clip-path:polygon(10px 40px,10px calc(100% - 65px),57px calc(100% - 10px),calc(100% - 10px) calc(100% - 10px),calc(100% - 10px) 72px,172px 72px,140px 40px,10px 40px,139px 41px,171px 73px,calc(100% - 11px) 73px,calc(100% - 11px) calc(100% - 11px),58px calc(100% - 11px),11px calc(100% - 66px),11px 41px,141px 41px,10px 40px)}
.vg-card.mirror .vg-card-edge{clip-path:polygon(calc(100% - 0px) 30px,calc(100% - 0px) calc(100% - 61px),calc(100% - 53px) calc(100% - 0px),0px calc(100% - 0px),0px 62px,calc(100% - 175px) 62px,calc(100% - 144px) 30px,calc(100% - 0px) 30px,calc(100% - 144px) 31px,calc(100% - 175px) 63px,1px 63px,1px calc(100% - 1px),calc(100% - 53px) calc(100% - 1px),calc(100% - 1px) calc(100% - 61px),calc(100% - 1px) 31px,calc(100% - 144px) 31px)}
.vg-card.mirror .vg-card-tab{justify-content:flex-start;clip-path:polygon(calc(100% - 144px) 0,calc(100% - 144px) 30px,calc(100% - 176px) 100%,0% 100%,0% 0%);border-right:0;border-left:1px solid var(--vg-accent)}
.vg-card.mirror .vg-card-tab::before{left:auto;right:144px}
.vg-card.mirror .vg-card-body{clip-path:polygon(calc(100% - 10px) 40px,calc(100% - 10px) calc(100% - 65px),calc(100% - 57px) calc(100% - 10px),10px calc(100% - 10px),10px 72px,calc(100% - 171px) 72px,calc(100% - 139px) 40px)}
.vg-card.mirror .vg-card-body::after{clip-path:polygon(calc(100% - 10px) 40px,calc(100% - 10px) calc(100% - 65px),calc(100% - 57px) calc(100% - 10px),10px calc(100% - 10px),10px 72px,calc(100% - 172px) 72px,calc(100% - 140px) 40px,calc(100% - 10px) 40px,calc(100% - 139px) 41px,calc(100% - 171px) 73px,11px 73px,11px calc(100% - 11px),calc(100% - 58px) calc(100% - 11px),calc(100% - 11px) calc(100% - 66px),calc(100% - 11px) 41px,calc(100% - 141px) 41px,calc(100% - 10px) 40px)}
.vg-card h3{margin:0 0 14px;font-size:18px;line-height:1.3;font-weight:700}
.vg-text{margin:0;font-size:clamp(.9375rem,1.25vw,1.125rem);line-height:1.5;font-weight:500}
.vg-word{transition:color .15s}
.vg-text[data-audio] .vg-word{color:rgba(255,255,255,.3)}
.vg-text[data-audio] .vg-word.on{color:#fff}
.vg-quote{position:relative;margin:0;padding:34px 0 0}
.vg-quote::before{content:"\\201C";position:absolute;left:-2px;top:-10px;font-family:var(--vg-display,"Unbounded",sans-serif);font-weight:800;font-size:64px;line-height:1;color:var(--vg-accent)}
.vg-quote p{margin:0;font-size:18px;line-height:1.45;font-weight:700;letter-spacing:-.005em}
.vg-points{margin:20px 0 0;padding:16px 0 0;border-top:1px solid rgba(255,255,255,.18);list-style:none;display:flex;flex-direction:column;gap:10px;font-size:15px;line-height:1.45;opacity:.9}
.vg-upnext{margin:20px 0 0;padding:14px 0 0;border-top:1px solid rgba(255,255,255,.18);display:flex;align-items:baseline;gap:10px;min-width:0;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
.vg-upnext .k{flex-shrink:0;color:var(--vg-accent)}
.vg-upnext span:not(.k){min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;opacity:.8}
.vg-points li{position:relative;padding-left:16px}
.vg-points li::before{content:"";position:absolute;left:0;top:.6em;width:6px;height:6px;border-radius:50%;background:var(--vg-accent)}

/* ---- music toggle: bottom-left, same chamfered family as the narration dock (lib/narrationDock.ts) on the right */
.vg-music{position:fixed;left:16px;bottom:16px;bottom:max(16px,env(safe-area-inset-bottom));z-index:40;display:inline-flex;align-items:center;gap:8px;height:40px;padding:0 18px 0 12px;border:1px solid var(--vg-accent);background:rgba(10,6,20,.6);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);color:#fff;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;white-space:nowrap;clip-path:polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px);transition:background .3s,color .3s}
.vg-music:hover{background:var(--vg-accent);color:#0a0614}
.vg-music:focus-visible{outline:2px solid #fff;outline-offset:-5px}
.vg-music-icon{display:grid;place-items:center;width:16px;height:16px;color:var(--vg-accent);transition:color .3s}
.vg-music:hover .vg-music-icon{color:#0a0614}
.vg-music-icon svg{display:block;width:14px;height:14px}
.vg-music-icon .slash{display:none}
.vg-music[data-on=false] .vg-music-icon .slash{display:block}
@media(max-width:480px){.vg-music-label{display:none}.vg-music{padding:0 12px}}

/* ---- navigation */
.vg-segs{position:fixed;z-index:20;left:50%;translate:-50% 0;bottom:calc(clamp(16px,3vh,32px) + 80px);width:min(580px,calc(100% - 28px));display:flex;gap:3px}
.vg-segs button{flex:1;height:16px;padding:0;border:0;background:none;position:relative}
.vg-segs button::before{content:"";position:absolute;left:0;right:0;top:6px;height:3px;background:rgba(255,255,255,.28);transition:background .3s}
.vg-segs button.done::before{background:color-mix(in srgb,var(--vg-accent) 55%,transparent)}
.vg-segs button.on::before{background:var(--vg-accent)}
.vg-nav{position:fixed;z-index:20;left:50%;translate:-50% 0;bottom:clamp(16px,3vh,32px);width:min(580px,calc(100% - 28px));height:72px}
.vg-nav-edge,.vg-nav-frame{position:absolute;inset:0;clip-path:polygon(8px 15px,8px calc(100% - 8px),calc(100% - 46px) calc(100% - 8px),calc(100% - 8px) calc(100% - 30px),calc(100% - 8px) 18px,calc(100% - 19px) 8px,114px 8px,107px 15px)}
.vg-nav-edge{background:var(--vg-accent);opacity:.9}
.vg-nav-frame{inset:1.5px;background:rgba(10,6,20,.78);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);overflow:hidden}
.vg-nav-fill{position:absolute;inset:0;background:var(--vg-accent);opacity:.32;transform-origin:left;transform:scaleX(0)}
.vg-nav-row{position:absolute;inset:0;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:6px;padding:0 26px 0 20px}
.vg-nav-row button{background:none;border:0;padding:8px 6px;font-size:13px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:opacity .3s,color .3s}
.vg-nav-row button:hover:not(:disabled){color:var(--vg-accent)}
.vg-nav-row button:disabled{opacity:.3;cursor:default}
.vg-nav-row .prev{text-align:left}.vg-nav-row .next{text-align:right}
.vg-nav-row .count{font-size:15px;font-weight:800;letter-spacing:.1em;color:var(--vg-accent)}
.vg-nav-row button:focus-visible,.vg-segs button:focus-visible{outline:2px solid #fff;outline-offset:1px}
@media(orientation:portrait){.vg-planet{--pw:min(190vw,1500px);bottom:calc(var(--pw) * -.5)}}
@media(max-width:1099px){.vg-nav{bottom:76px}.vg-segs{bottom:calc(76px + 78px)}}
@media(max-width:560px){.vg-card-body{padding:94px 22px 70px}.vg-nav-row button{font-size:12px}.vg-select-card{top:44%}}
@media(prefers-reduced-motion:reduce){.vg-marquee-inner,.vg-planet img,.vg-rocks,.vg-art-prop img,.vg-video video,.vg-video img,.vg-sky-twinkle{animation:none}}
`;
