import { useState, useEffect, useRef } from "react";

// ─── CONFIG ──────────────────────────────────────────────────
const ADMIN_KEY = "dispatch2024";
const ADMIN_PASS = "Dispatch@2024!";

const PRICING_DEF = {
  baseRate: 1200, perMile: 3.5, driverCut: 75,
  mul: { general:1.0, fragile:1.3, chemical:1.6, cold:1.5, heavy:1.4, livestock:1.7 },
};

const CARGO_ICONS = { general:"📦", fragile:"🫙", chemical:"⚗️", cold:"❄️", heavy:"⚙️", livestock:"🐄" };

const CARGO = {
  en: { general:"General Cargo", fragile:"Fragile", chemical:"Chemical", cold:"Cold Chain", heavy:"Heavy Load", livestock:"Livestock" },
  es: { general:"Carga General", fragile:"Frágil", chemical:"Químico", cold:"Cadena de Frío", heavy:"Carga Pesada", livestock:"Ganado" },
};

const TRAILERS = [
  { id:"flatbed",  label:"Flatbed",      icon:"🚛", desc:"Open, 48ft" },
  { id:"dry_van",  label:"Dry Van",      icon:"📦", desc:"Enclosed" },
  { id:"reefer",   label:"Refrigerated", icon:"❄️", desc:"Temp control" },
  { id:"tanker",   label:"Tanker",       icon:"⚗️", desc:"Liquid / gas" },
  { id:"lowboy",   label:"Lowboy",       icon:"⚙️", desc:"Oversized" },
  { id:"livestock",label:"Livestock",    icon:"🐄", desc:"Animals" },
];

const ROUTES = [
  { id:"1", from:"Houston, TX",     to:"Dallas, TX",    dist:239 },
  { id:"2", from:"Los Angeles, CA", to:"Phoenix, AZ",   dist:370 },
  { id:"3", from:"Chicago, IL",     to:"Detroit, MI",   dist:280 },
  { id:"4", from:"Miami, FL",       to:"Atlanta, GA",   dist:662 },
];

const REVENUE = [
  { m:"Sep", rev:84200,  pay:63150, com:21050 },
  { m:"Oct", rev:91400,  pay:68550, com:22850 },
  { m:"Nov", rev:78600,  pay:58950, com:19650 },
  { m:"Dec", rev:103200, pay:77400, com:25800 },
  { m:"Jan", rev:96800,  pay:72600, com:24200 },
  { m:"Feb", rev:112400, pay:84300, com:28100 },
];

const LIVE_TRIPS = [
  { id:"T-001", driver:"James Harlow",  company:"Lone Star Freight", from:"Houston",     to:"Dallas",  cargo:"Cold Chain", pct:68, price:2950 },
  { id:"T-002", driver:"Sara Mitchell", company:null,                from:"Chicago",     to:"Detroit", cargo:"General",    pct:31, price:2100 },
  { id:"T-003", driver:"Ray Nguyen",    company:"Pacific Haulers",   from:"Los Angeles", to:"Phoenix", cargo:"Chemical",   pct:85, price:4200 },
];

const INIT_USERS = [
  { id:"u1", role:"driver",  dType:"fleet",        name:"James Harlow",  email:"james@lonestar.com",     company:"Lone Star Freight LLC", plate:"TX-4521-AB", rating:4.8, trips:312, violations:0, blacklisted:false },
  { id:"u2", role:"driver",  dType:"independent",  name:"Carlos Rivera", email:"carlos@email.com",       company:null,                    plate:"CA-8873-KT", rating:4.6, trips:189, violations:1, blacklisted:false },
  { id:"u3", role:"driver",  dType:"fleet",        name:"David Chen",    email:"david@pacific.com",      company:"Pacific Haulers Inc.",  plate:"FL-2210-HL", rating:4.9, trips:541, violations:0, blacklisted:false },
  { id:"u4", role:"driver",  dType:"independent",  name:"Marco Santos",  email:"marco@email.com",        company:null,                    plate:"TX-5543-MR", rating:4.7, trips:278, violations:0, blacklisted:false },
  { id:"u5", role:"shipper", sType:"company",      name:"Alice Morgan",  email:"alice@abclogistics.com", company:"ABC Logistics Inc.",    plate:null,         rating:4.9, trips:87,  violations:0, blacklisted:false },
  { id:"u6", role:"shipper", sType:"individual",   name:"Bob Turner",    email:"bob@email.com",          company:null,                    plate:null,         rating:4.3, trips:12,  violations:2, blacklisted:false },
  { id:"u7", role:"shipper", sType:"company",      name:"Diana Park",    email:"diana@freshfoods.com",   company:"Fresh Foods LLC",       plate:null,         rating:4.7, trips:54,  violations:0, blacklisted:true  },
];

const calcPrice = (dist, mul, p) =>
  Math.round(((p.baseRate + dist * p.perMile) * mul) / 50) * 50;

// ─── TRANSLATIONS ────────────────────────────────────────────
const T = {
  en: {
    appName:"Dispatch",
    tagline:"Move freight.\nSimply.",
    sub:"Connect with verified drivers.\nFixed prices. Real-time tracking.",
    getStarted:"Get started", signIn:"Sign in", signOut:"Sign out",
    noAccount:"Don't have an account?", haveAccount:"Already have an account?",
    shipper:"Shipper", driver:"Driver",
    welcome:"Welcome back", signInSub:"Sign in to continue",
    createAccount:"Create account",
    email:"Email", password:"Password", confirmPw:"Confirm password",
    firstName:"First name", lastName:"Last name", phone:"Phone",
    shipperType:"Account type", individual:"Individual", company:"Company",
    companyName:"Company name", dot:"DOT number", taxId:"Tax ID",
    driverType:"Driver type", independent:"Independent", fleet:"Fleet / Company",
    independentNote:"Independent driver — Payments go directly to your bank account.",
    fleetNote:"Fleet driver — Payments go to your fleet company. Your employer manages payroll.",
    cdl:"CDL number", cdlState:"CDL state", cdlExpiry:"CDL expiry",
    truckMake:"Make", truckModel:"Model", truckYear:"Year",
    truckPlate:"Plate number", truckColor:"Color", truckVin:"VIN (optional)",
    bankName:"Bank name", bankRouting:"Routing number", bankAccount:"Account number",
    fleetName:"Fleet / Company name", fleetDot:"Fleet DOT", fleetMc:"MC number (optional)",
    fleetAddress:"Company address", fleetContact:"Fleet contact phone",
    reviewTerms:"Review & Accept Terms", creating:"Creating…",
    continueBtn:"Continue", backBtn:"Back",
    selectRoute:"Select route & cargo", cargoType:"Cargo type",
    trailerOwn:"Trailer", myTrailer:"My own trailer", needTrailer:"Need trailer",
    trailerType:"Trailer type",
    pickupDate:"Pickup date", pickupTime:"Time",
    pickupAddr:"Pickup address", deliveryAddr:"Delivery address",
    weightLbs:"Weight (lbs)", cargoDesc:"Description", specialInstr:"Special instructions",
    reviewPay:"Review & pay", totalLabel:"Total", fixedRate:"Fixed rate · No negotiation",
    dispatchBtn:"🚛 Dispatch", findingDriver:"Finding your driver",
    checkingDrivers:"Checking nearby drivers…",
    liveTracking:"Live tracking · En route to pickup",
    driversNear:"3 drivers active near you",
    fleetCo:"Fleet company", payGoesFleet:"💳 Payment goes to fleet company",
    driverLabel:"Driver", truckLabel:"Truck",
    speed:"Speed", locLabel:"Location", eta:"ETA", progressLabel:"Progress",
    enRoute:"En route", rateExp:"Rate your experience", howWas:"How was your delivery?",
    submitRating:"Submit rating", thanksMsg:"Thank you", reviewSaved:"Your review has been submitted.",
    newShipment:"New shipment",
    readyJobs:"Ready for jobs", waitNote:"You'll get notified when a job is nearby.",
    todayJobs:"Today's jobs", newJobOffer:"New job offer",
    yourPayout:"Your payout", directBank:"Direct to your bank", totalTrip:"Total",
    routeLabel:"Route", distLabel:"Distance", pickupLabel:"Pickup",
    onTrip:"On trip", available:"Available", offline:"Offline",
    fleetDriver:"Fleet driver", indepDriver:"Independent",
    completeDelivery:"Complete delivery", remaining:"Remaining",
    pickupPhoto:"Pickup photo", deliveryPhoto:"Delivery photo",
    pickupVerifyTitle:"Pickup verification", pickupVerifySub:"Photograph the cargo before loading",
    deliveryVerifyTitle:"Delivery verification", deliveryVerifySub:"Photograph the cargo after unloading",
    openCamera:"Open camera", cancelBtn:"Cancel", captureBtn:"📸 Capture",
    retakeBtn:"Retake", usePhotoBtn:"✓ Use photo", photoVerifiedMsg:"Photo verified",
    photoSharedMsg:"Shared with shipper", skipBtn:"Skip",
    camErr:"Camera not available.",
    findNextJob:"Find next job",
    paidFleet:"Paid to fleet company", paidBank:"Sent to your bank account",
    paymentSent:"Payment sent",
    todayEarnings:"Today", weekEarnings:"This week", totalEarnings:"Total",
    paymentTo:"Payment to", employerPayroll:"Your employer manages payroll",
    directDeposit:"Direct deposit · 1–2 business days",
    fleetTag:"Fleet",
    statsDrivers:"Active drivers", statsOnTime:"On-time rate", statsCoverage:"Coverage",
    messageBtn:"Message", chatOnline:"Online · En route",
    cardNumber:"Card number", expiry:"Expiry", cvv:"CVV", cardName:"Name on card",
    payNow:"Pay", processing:"Processing…", orderSummary:"Total",
    payWith:"Pay with",
    available:"Available", offline:"Offline", backBtn:"Back",
    bankAccount:"Account number", bankRouting:"Routing number",
    cancelBtn:"Cancel", captureBtn:"📸 Capture", cardName:"Name on card",
    cargoDesc:"Description", cargoType:"Cargo type", cdlExpiry:"CDL expiry", cdlState:"CDL state",
    chatOnline:"Online · En route", company:"Company", confirmPw:"Confirm password",
    cvv:"CVV", deliveryAddr:"Delivery address", deliveryPhoto:"Delivery photo",
    deliveryVerifySub:"Photograph the cargo after unloading",
    directBank:"Direct to your bank", distLabel:"Distance", dot:"DOT number",
    driver:"Driver", employerPayroll:"Your employer manages payroll",
    eta:"ETA", expiry:"Expiry", findingDriver:"Finding your driver",
    fixedRate:"Fixed rate · No negotiation", fleet:"Fleet / Company",
    fleetContact:"Fleet contact phone", fleetDot:"Fleet DOT", fleetMc:"MC number (optional)",
    haveAccount:"Already have an account?", howWas:"How was your delivery?",
    indepDriver:"Independent", independent:"Independent", individual:"Individual",
    lastName:"Last name", locLabel:"Location", myTrailer:"My own trailer",
    needTrailer:"Need trailer", newJobOffer:"New job offer",
    offline:"Offline", orderSummary:"Total", paidBank:"Sent to your bank account",
    password:"Password", phone:"Phone", photoVerifiedMsg:"Photo verified",
    pickupLabel:"Pickup", pickupTime:"Time", pickupVerifySub:"Photograph the cargo before loading",
    processing:"Processing…", progressLabel:"Progress",
    rateExp:"Rate your experience", remaining:"Remaining", reviewSaved:"Your review has been submitted.",
    signIn:"Sign in", signInSub:"Sign in to continue", signOut:"Sign out",
    skipBtn:"Skip", specialInstr:"Special instructions",
    statsCoverage:"Coverage", statsOnTime:"On-time rate",
    taxId:"Tax ID", thanksMsg:"Thank you", totalEarnings:"Total",
    totalLabel:"Total", truckColor:"Color", truckLabel:"Truck",
    truckModel:"Model", truckVin:"VIN (optional)", truckYear:"Year",
    usePhotoBtn:"✓ Use photo", waitNote:"You'll get notified when a job is nearby.",
    weekEarnings:"This week",
  },
  es: {
    appName:"Dispatch",
    tagline:"Mueve tu carga.\nSimplemente.",
    sub:"Conecta con conductores verificados.\nPrecios fijos. Seguimiento en tiempo real.",
    getStarted:"Comenzar", signIn:"Iniciar sesión", signOut:"Cerrar sesión",
    noAccount:"¿No tienes cuenta?", haveAccount:"¿Ya tienes cuenta?",
    shipper:"Cargador", driver:"Conductor",
    welcome:"Bienvenido", signInSub:"Inicia sesión para continuar",
    createAccount:"Crear cuenta",
    email:"Correo electrónico", password:"Contraseña", confirmPw:"Confirmar contraseña",
    firstName:"Nombre", lastName:"Apellido", phone:"Teléfono",
    shipperType:"Tipo de cuenta", individual:"Particular", company:"Empresa",
    companyName:"Nombre de empresa", dot:"Número DOT", taxId:"RFC / EIN",
    driverType:"Tipo de conductor", independent:"Independiente", fleet:"Flota / Empresa",
    independentNote:"Conductor independiente — Los pagos van directamente a tu cuenta bancaria.",
    fleetNote:"Conductor de flota — Los pagos van a tu empresa. Tu empleador gestiona la nómina.",
    cdl:"Número CDL", cdlState:"Estado CDL", cdlExpiry:"Vencimiento CDL",
    truckMake:"Marca", truckModel:"Modelo", truckYear:"Año",
    truckPlate:"Número de placa", truckColor:"Color", truckVin:"VIN (opcional)",
    bankName:"Nombre del banco", bankRouting:"Número de ruta", bankAccount:"Número de cuenta",
    fleetName:"Nombre de la flota / empresa", fleetDot:"DOT de la flota", fleetMc:"Número MC (opcional)",
    fleetAddress:"Dirección de la empresa", fleetContact:"Teléfono de contacto",
    reviewTerms:"Revisar y aceptar términos", creating:"Creando…",
    continueBtn:"Continuar", backBtn:"Atrás",
    selectRoute:"Seleccionar ruta y carga", cargoType:"Tipo de carga",
    trailerOwn:"Remolque", myTrailer:"Mi propio remolque", needTrailer:"Necesito remolque",
    trailerType:"Tipo de remolque",
    pickupDate:"Fecha de recogida", pickupTime:"Hora",
    pickupAddr:"Dirección de recogida", deliveryAddr:"Dirección de entrega",
    weightLbs:"Peso (lbs)", cargoDesc:"Descripción", specialInstr:"Instrucciones especiales",
    reviewPay:"Revisar y pagar", totalLabel:"Total", fixedRate:"Tarifa fija · Sin negociación",
    dispatchBtn:"🚛 Despachar", findingDriver:"Buscando tu conductor",
    checkingDrivers:"Verificando conductores cercanos…",
    liveTracking:"Seguimiento en vivo · En camino a recogida",
    driversNear:"3 conductores activos cerca",
    fleetCo:"Empresa de flota", payGoesFleet:"💳 El pago va a la empresa de flota",
    driverLabel:"Conductor", truckLabel:"Camión",
    speed:"Velocidad", locLabel:"Ubicación", eta:"ETA", progressLabel:"Progreso",
    enRoute:"En camino", rateExp:"Califica tu experiencia", howWas:"¿Cómo fue tu entrega?",
    submitRating:"Enviar calificación", thanksMsg:"Gracias", reviewSaved:"Tu reseña fue enviada.",
    newShipment:"Nuevo envío",
    readyJobs:"Listo para trabajos", waitNote:"Te notificaremos cuando haya un trabajo cercano.",
    todayJobs:"Trabajos de hoy", newJobOffer:"Nueva oferta de trabajo",
    yourPayout:"Tu pago", directBank:"Directo a tu banco", totalTrip:"Total",
    routeLabel:"Ruta", distLabel:"Distancia", pickupLabel:"Recogida",
    onTrip:"En viaje", available:"Disponible", offline:"Fuera de línea",
    fleetDriver:"Conductor de flota", indepDriver:"Independiente",
    completeDelivery:"Completar entrega", remaining:"Restante",
    pickupPhoto:"Foto de recogida", deliveryPhoto:"Foto de entrega",
    pickupVerifyTitle:"Verificación de recogida", pickupVerifySub:"Fotografía la carga antes de cargar",
    deliveryVerifyTitle:"Verificación de entrega", deliveryVerifySub:"Fotografía la carga después de descargar",
    openCamera:"Abrir cámara", cancelBtn:"Cancelar", captureBtn:"📸 Capturar",
    retakeBtn:"Repetir", usePhotoBtn:"✓ Usar foto", photoVerifiedMsg:"Foto verificada",
    photoSharedMsg:"Compartida con el cargador", skipBtn:"Omitir",
    camErr:"Cámara no disponible.",
    findNextJob:"Buscar trabajo",
    paidFleet:"Pagado a la empresa de flota", paidBank:"Enviado a tu cuenta bancaria",
    paymentSent:"Pago enviado",
    todayEarnings:"Hoy", weekEarnings:"Esta semana", totalEarnings:"Total",
    paymentTo:"Pago a", employerPayroll:"Tu empleador gestiona la nómina",
    directDeposit:"Depósito directo · 1–2 días hábiles",
    fleetTag:"Flota",
    statsDrivers:"Conductores activos", statsOnTime:"A tiempo", statsCoverage:"Cobertura",
    messageBtn:"Mensaje", chatOnline:"En línea · En camino",
    cardNumber:"Número de tarjeta", expiry:"Vencimiento", cvv:"CVV", cardName:"Nombre en tarjeta",
    payNow:"Pagar", processing:"Procesando…", orderSummary:"Total",
    payWith:"Pagar con",
    available:"Disponible", offline:"Fuera de línea", backBtn:"Atrás",
    bankAccount:"Número de cuenta", bankRouting:"Número de ruta",
    cancelBtn:"Cancelar", captureBtn:"📸 Capturar", cardName:"Nombre en tarjeta",
    cargoDesc:"Descripción", cargoType:"Tipo de carga", cdlExpiry:"Vencimiento CDL", cdlState:"Estado CDL",
    chatOnline:"En línea · En camino", company:"Empresa", confirmPw:"Confirmar contraseña",
    cvv:"CVV", deliveryAddr:"Dirección de entrega", deliveryPhoto:"Foto de entrega",
    deliveryVerifySub:"Fotografía la carga después de descargar",
    directBank:"Directo a tu banco", distLabel:"Distancia", dot:"Número DOT",
    driver:"Conductor", employerPayroll:"Tu empleador gestiona la nómina",
    eta:"ETA", expiry:"Vencimiento", findingDriver:"Buscando tu conductor",
    fixedRate:"Tarifa fija · Sin negociación", fleet:"Flota / Empresa",
    fleetContact:"Teléfono de contacto", fleetDot:"DOT de la flota", fleetMc:"Número MC (opcional)",
    haveAccount:"¿Ya tienes cuenta?", howWas:"¿Cómo fue tu entrega?",
    indepDriver:"Independiente", independent:"Independiente", individual:"Particular",
    lastName:"Apellido", locLabel:"Ubicación", myTrailer:"Mi propio remolque",
    needTrailer:"Necesito remolque", newJobOffer:"Nueva oferta de trabajo",
    orderSummary:"Total", paidBank:"Enviado a tu cuenta bancaria",
    password:"Contraseña", phone:"Teléfono", photoVerifiedMsg:"Foto verificada",
    pickupLabel:"Recogida", pickupTime:"Hora", pickupVerifySub:"Fotografía la carga antes de cargar",
    processing:"Procesando…", progressLabel:"Progreso",
    rateExp:"Califica tu experiencia", remaining:"Restante", reviewSaved:"Tu reseña fue enviada.",
    signIn:"Iniciar sesión", signInSub:"Inicia sesión para continuar", signOut:"Cerrar sesión",
    skipBtn:"Omitir", specialInstr:"Instrucciones especiales",
    statsCoverage:"Cobertura", statsOnTime:"A tiempo",
    taxId:"RFC / EIN", thanksMsg:"Gracias", totalEarnings:"Total",
    totalLabel:"Total", truckColor:"Color", truckLabel:"Camión",
    truckModel:"Modelo", truckVin:"VIN (opcional)", truckYear:"Año",
    usePhotoBtn:"✓ Usar foto", waitNote:"Te notificaremos cuando haya un trabajo cercano.",
    weekEarnings:"Esta semana",
  },
};

// ─── DESIGN TOKENS ───────────────────────────────────────────
const C = {
  bg:"#0A0A0A", surf:"#141414", surf2:"#1C1C1C", border:"#2A2A2A",
  text:"#FFFFFF", sub:"#8A8A8A", muted:"#3A3A3A",
  blue:"#276EF1", green:"#05944F", red:"#E11900", amber:"#FFC043",
};

const G = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${C.bg};color:${C.text};font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased}
  ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:${C.bg}} ::-webkit-scrollbar-thumb{background:${C.muted};border-radius:2px}
  input,select,textarea,button{font-family:'Inter',sans-serif} input:focus,select:focus,textarea:focus{outline:none} ::placeholder{color:${C.muted}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}
  @keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
  @keyframes msgIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
  .fu{animation:fadeUp .3s cubic-bezier(.4,0,.2,1) both}
  .fi{animation:fadeIn .2s ease both}
  .su{animation:slideUp .4s cubic-bezier(.4,0,.2,1) both}
  .inp{width:100%;background:${C.surf2};border:1px solid ${C.border};border-radius:8px;padding:13px 14px;color:${C.text};font-size:14px;transition:border-color .15s}
  .inp:focus{border-color:${C.blue}}
  .btnP{width:100%;background:${C.text};color:${C.bg};border:none;border-radius:8px;padding:15px;font-size:14px;font-weight:600;cursor:pointer;transition:opacity .15s}
  .btnP:hover{opacity:.9}
  .btnS{width:100%;background:transparent;color:${C.text};border:1px solid ${C.border};border-radius:8px;padding:14px;font-size:14px;font-weight:500;cursor:pointer;transition:border-color .15s}
  .btnS:hover{border-color:${C.sub}}
  .btnB{background:${C.surf2};color:${C.text};border:1px solid ${C.border};border-radius:8px;padding:8px 14px;font-size:13px;font-weight:500;cursor:pointer}
  .chip{display:inline-flex;align-items:center;gap:5px;background:${C.surf2};border:1px solid ${C.border};border-radius:6px;padding:7px 12px;font-size:13px;font-weight:500;color:${C.sub};cursor:pointer;transition:all .15s}
  .chip.on{background:${C.text};color:${C.bg};border-color:${C.text}}
  .chip:hover:not(.on){border-color:${C.sub};color:${C.text}}
  .card{background:${C.surf};border:1px solid ${C.border};border-radius:12px;overflow:hidden}
  .row{display:flex;justify-content:space-between;align-items:center;padding:14px 0;border-bottom:1px solid ${C.border}}
  .row:last-child{border-bottom:none}
  .lbl{font-size:11px;font-weight:500;color:${C.sub};text-transform:uppercase;letter-spacing:.08em}
  .tile{background:${C.surf};border:1.5px solid ${C.border};border-radius:10px;padding:14px;cursor:pointer;transition:all .15s}
  .tile.on{border-color:${C.text};background:#1E1E1E}
  .tile:hover:not(.on){border-color:#444}
  .tag{display:inline-block;font-size:11px;font-weight:600;padding:3px 8px;border-radius:5px}
`;

// ─── HELPERS ─────────────────────────────────────────────────
function F({ label, type="text", value, onChange, placeholder="", rows }) {
  return (
    <div style={{marginBottom:12}}>
      {label && <div className="lbl" style={{marginBottom:5}}>{label}</div>}
      {rows
        ? <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} className="inp" style={{resize:"vertical",lineHeight:1.5}}/>
        : <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className="inp"/>
      }
    </div>
  );
}

function Stars({ rating, interactive=false, onRate, size=13 }) {
  return (
    <div style={{display:"flex",gap:2,alignItems:"center"}}>
      {[1,2,3,4,5].map(s=>(
        <span key={s} onClick={()=>interactive&&onRate&&onRate(s)}
          style={{color:s<=Math.floor(rating)?C.amber:C.muted,fontSize:size,cursor:interactive?"pointer":"default"}}>★</span>
      ))}
      {!interactive && <span style={{color:C.sub,fontSize:size-2,marginLeft:3}}>{rating}</span>}
    </div>
  );
}

// ─── MAP ─────────────────────────────────────────────────────
function MapView({ trackMode, height=220 }) {
  const ref = useRef(null);
  const tick = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    function resize() { canvas.width = canvas.offsetWidth || 600; canvas.height = height; }
    resize();
    function draw() {
      const W = canvas.width, H = canvas.height;
      ctx.fillStyle = "#0D0D0D"; ctx.fillRect(0,0,W,H);
      ctx.fillStyle = "#111";
      [[0,0,W*.18,H*.45],[W*.22,0,W*.14,H*.55],[W*.42,0,W*.12,H*.35],[W*.6,0,W*.16,H*.4],
       [0,H*.6,W*.2,H*.4],[W*.25,H*.55,W*.18,H*.45],[W*.5,H*.65,W*.22,H*.35],[W*.78,H*.5,W*.22,H*.5]]
        .forEach(([x,y,w,h]) => ctx.fillRect(x,y,w,h));
      ctx.strokeStyle="#1A1A1A"; ctx.lineWidth=12; ctx.lineCap="round";
      [[0,H*.5,W,H*.5],[W*.2,0,W*.2,H],[W*.44,0,W*.44,H],[W*.76,0,W*.76,H],[0,H*.25,W,H*.25],[0,H*.75,W,H*.75]]
        .forEach(([x1,y1,x2,y2]) => { ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke(); });
      [[W*.15,H*.3],[W*.5,H*.6],[W*.35,H*.75],[W*.72,H*.22]].forEach(([x,y],i) => {
        const busy = i===2;
        ctx.fillStyle = busy?"#1A1A1A":"#1E1E1E"; ctx.beginPath(); ctx.arc(x,y,18,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle = busy?"#2A2A2A":"#444"; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(x,y,18,0,Math.PI*2); ctx.stroke();
        ctx.font="13px sans-serif"; ctx.textAlign="center"; ctx.globalAlpha=busy?.35:.9;
        ctx.fillStyle="#fff"; ctx.fillText("🚛",x,y+5); ctx.globalAlpha=1; ctx.textAlign="left";
      });
      if (trackMode) {
        ctx.strokeStyle=C.blue; ctx.lineWidth=2.5; ctx.setLineDash([6,5]); ctx.globalAlpha=.65;
        ctx.beginPath(); ctx.moveTo(W*.08,H*.85); ctx.bezierCurveTo(W*.3,H*.5,W*.65,H*.55,W*.93,H*.15); ctx.stroke();
        ctx.setLineDash([]); ctx.globalAlpha=1;
        ctx.fillStyle=C.green; ctx.shadowColor=C.green; ctx.shadowBlur=10;
        ctx.beginPath(); ctx.arc(W*.08,H*.85,7,0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0;
        ctx.fillStyle=C.text; ctx.beginPath(); ctx.arc(W*.93,H*.15,7,0,Math.PI*2); ctx.fill();
        const p = (Math.sin(tick.current*.009)+1)/2;
        const tx = W*.08+(W*.93-W*.08)*p, ty = H*.85+(H*.15-H*.85)*p;
        ctx.fillStyle=C.blue; ctx.shadowColor=C.blue; ctx.shadowBlur=14;
        ctx.beginPath(); ctx.arc(tx,ty,11,0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0;
        ctx.font="10px sans-serif"; ctx.textAlign="center"; ctx.fillText("🚛",tx,ty+4); ctx.textAlign="left";
      }
    }
    let fr; function loop(){tick.current++;draw();fr=requestAnimationFrame(loop);} loop();
    return ()=>cancelAnimationFrame(fr);
  },[trackMode,height]);
  return <canvas ref={ref} style={{width:"100%",height,display:"block"}}/>;
}

// ─── CAMERA ──────────────────────────────────────────────────
function Camera({ title, sub, onCapture, onSkip, t }) {
  const vidRef = useRef(null); const canRef = useRef(null); const streamRef = useRef(null);
  const [phase, setPhase] = useState("prompt");
  const [photo, setPhoto] = useState(null);
  const [err, setErr] = useState("");

  async function start() {
    setErr("");
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:"environment" }, audio:false });
      streamRef.current = s;
      if (vidRef.current) { vidRef.current.srcObject=s; vidRef.current.play(); }
      setPhase("live");
    } catch(e) { setErr(t.camErr+" "+e.message); }
  }
  function snap() {
    const v=vidRef.current, c=canRef.current; if(!v||!c) return;
    c.width=v.videoWidth||640; c.height=v.videoHeight||480;
    c.getContext("2d").drawImage(v,0,0);
    setPhoto(c.toDataURL("image/jpeg",.85));
    stop(); setPhase("preview");
  }
  function stop() { streamRef.current?.getTracks().forEach(t=>t.stop()); streamRef.current=null; }
  function confirm() { onCapture(photo); setPhase("done"); }
  function retake() { setPhoto(null); start(); }
  useEffect(()=>()=>stop(),[]);

  return (
    <div className="card">
      <div style={{padding:"14px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontWeight:600,fontSize:14}}>{title}</div>
          <div style={{color:C.sub,fontSize:12,marginTop:2}}>{sub}</div>
        </div>
        {onSkip && <button onClick={onSkip} className="btnB" style={{fontSize:12}}>{t.skipBtn}</button>}
      </div>
      {phase==="prompt" && (
        <div style={{padding:20,textAlign:"center"}}>
          <div style={{fontSize:44,marginBottom:14}}>📷</div>
          <div style={{color:C.sub,fontSize:13,marginBottom:18,lineHeight:1.5}}>Take a photo to verify. This will be shared with the shipper.</div>
          {err && <div style={{color:C.red,fontSize:12,marginBottom:12,padding:"9px 12px",background:"#1A0A0A",borderRadius:8}}>{err}</div>}
          <button className="btnP" onClick={start}>{t.openCamera}</button>
        </div>
      )}
      {phase==="live" && (
        <div style={{background:"#000"}}>
          <video ref={vidRef} autoPlay playsInline muted style={{width:"100%",display:"block",maxHeight:300,objectFit:"cover"}}/>
          <div style={{padding:14,display:"flex",gap:10}}>
            <button className="btnS" onClick={()=>{stop();setPhase("prompt");}}>{t.cancelBtn}</button>
            <button className="btnP" onClick={snap}>{t.captureBtn}</button>
          </div>
        </div>
      )}
      {phase==="preview" && photo && (
        <div>
          <img src={photo} alt="capture" style={{width:"100%",display:"block",maxHeight:260,objectFit:"cover"}}/>
          <div style={{padding:14,display:"flex",gap:10}}>
            <button className="btnS" onClick={retake}>{t.retakeBtn}</button>
            <button className="btnP" onClick={confirm}>{t.usePhotoBtn}</button>
          </div>
        </div>
      )}
      {phase==="done" && (
        <div style={{padding:20,textAlign:"center"}}>
          <div style={{fontSize:32,marginBottom:8}}>✅</div>
          <div style={{fontWeight:600}}>{t.photoVerifiedMsg}</div>
          <div style={{color:C.sub,fontSize:13,marginTop:4}}>{t.photoSharedMsg}</div>
        </div>
      )}
      <canvas ref={canRef} style={{display:"none"}}/>
    </div>
  );
}

// ─── CHAT ────────────────────────────────────────────────────
function Chat({ myName, otherName, onClose, t }) {
  const [msgs, setMsgs] = useState([
    { id:1, from:"other", text:"Hi, I'm en route to the pickup. ETA about 45 minutes.", time:"10:14 AM" },
    { id:2, from:"me",    text:"Great, I'll be at the dock. Gate code is 4821.", time:"10:16 AM" },
    { id:3, from:"other", text:"Got it. Any special unloading instructions?", time:"10:17 AM" },
  ]);
  const [input, setInput] = useState("");
  const btmRef = useRef(null);
  const replies = ["On my way!","Copy that.","ETA updated — 20 mins.","I'm at the gate.","Loading complete.","Documents signed."];
  const rIdx = useRef(0);

  function send() {
    if (!input.trim()) return;
    const time = new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
    setMsgs(m=>[...m,{id:Date.now(),from:"me",text:input.trim(),time}]);
    setInput("");
    setTimeout(()=>{
      const r = replies[rIdx.current % replies.length]; rIdx.current++;
      setMsgs(m=>[...m,{id:Date.now()+1,from:"other",text:r,time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}]);
    },1500);
  }
  useEffect(()=>{ btmRef.current?.scrollIntoView({behavior:"smooth"}); },[msgs]);

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"flex-end",zIndex:2000}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{width:"100%",background:C.surf,maxHeight:"80vh",display:"flex",flexDirection:"column",borderRadius:"16px 16px 0 0"}} className="su">
        <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:"50%",background:C.surf2,display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${C.border}`,fontSize:18}}>🚛</div>
            <div>
              <div style={{fontWeight:600,fontSize:14}}>{otherName}</div>
              <div style={{display:"flex",alignItems:"center",gap:5,marginTop:1}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:C.green}}/>
                <span style={{color:C.sub,fontSize:11}}>{t.chatOnline}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.sub,fontSize:20,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:10}}>
          {msgs.map(m=>(
            <div key={m.id} style={{display:"flex",flexDirection:"column",alignItems:m.from==="me"?"flex-end":"flex-start",animation:"msgIn .25s ease"}}>
              <div style={{
                maxWidth:"75%",padding:"10px 13px",
                borderRadius:m.from==="me"?"14px 14px 3px 14px":"14px 14px 14px 3px",
                background:m.from==="me"?C.text:C.surf2,
                color:m.from==="me"?C.bg:C.text,
                fontSize:14,lineHeight:1.4,
                border:m.from==="me"?"none":`1px solid ${C.border}`,
              }}>{m.text}</div>
              <div style={{color:C.muted,fontSize:10,marginTop:3}}>{m.time}</div>
            </div>
          ))}
          <div ref={btmRef}/>
        </div>
        <div style={{padding:"10px 12px",borderTop:`1px solid ${C.border}`,display:"flex",gap:8,flexShrink:0}}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}
            placeholder="Message…" className="inp" style={{flex:1,padding:"11px 14px",borderRadius:24}}/>
          <button onClick={send} style={{width:42,height:42,borderRadius:"50%",background:input.trim()?C.text:C.surf2,border:`1px solid ${C.border}`,cursor:"pointer",fontSize:18,color:input.trim()?C.bg:C.sub,flexShrink:0}}>↑</button>
        </div>
      </div>
    </div>
  );
}

// ─── PAYMENT ─────────────────────────────────────────────────
function Payment({ amount, t, onSuccess, onCancel }) {
  const [prov, setProv] = useState("card");
  const [f, setF] = useState({ num:"", exp:"", cvv:"", name:"" });
  const [busy, setBusy] = useState(false);
  const [ppStep, setPpStep] = useState("form");
  const set = (k,v) => setF(p=>({...p,[k]:v}));
  const fmtCard = v => v.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim();
  const fmtExp  = v => v.replace(/\D/g,"").slice(0,4).replace(/^(\d{2})(\d)/,"$1/$2");
  function pay() { if(!f.num||!f.exp||!f.cvv||!f.name) return; setBusy(true); setTimeout(()=>{setBusy(false);onSuccess();},2000); }
  function startPP() { setPpStep("redirect"); setTimeout(()=>setPpStep("confirm"),1800); }
  function confirmPP() { setBusy(true); setTimeout(()=>{setBusy(false);onSuccess();},1200); }

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"flex-end",zIndex:1000}}
      onClick={e=>e.target===e.currentTarget&&onCancel()}>
      <div style={{width:"100%",background:C.surf,borderRadius:"16px 16px 0 0",padding:"0 20px 32px"}} className="su">
        <div style={{width:40,height:4,background:C.border,borderRadius:2,margin:"12px auto 20px"}}/>
        <div style={{fontSize:18,fontWeight:700,marginBottom:4}}>Payment</div>
        <div style={{color:C.sub,fontSize:14,marginBottom:18}}>{t.orderSummary}: <strong style={{color:C.text}}>${amount.toLocaleString()}</strong></div>
        <div style={{display:"flex",gap:8,marginBottom:20}}>
          {[{id:"card",label:"💳 Card"},{id:"paypal",label:"🅿️ PayPal"}].map(p=>(
            <button key={p.id} onClick={()=>setProv(p.id)} className={`chip ${prov===p.id?"on":""}`} style={{flex:1,justifyContent:"center",padding:"10px"}}>{p.label}</button>
          ))}
        </div>
        {prov==="card" && <>
          <F label={t.cardNumber} value={f.num} onChange={v=>set("num",fmtCard(v))} placeholder="1234 5678 9012 3456"/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <F label={t.expiry} value={f.exp} onChange={v=>set("exp",fmtExp(v))} placeholder="MM/YY"/>
            <F label={t.cvv} value={f.cvv} onChange={v=>set("cvv",v.replace(/\D/g,"").slice(0,4))} placeholder="•••" type="password"/>
          </div>
          <F label={t.cardName} value={f.name} onChange={v=>set("name",v)} placeholder="John Smith"/>
          <div style={{height:1,background:C.border,margin:"14px 0"}}/>
          <button className="btnP" onClick={pay} style={{opacity:busy?.6:1}}>
            {busy ? <span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><span style={{animation:"spin .8s linear infinite",display:"inline-block"}}>⟳</span>{t.processing}</span> : `${t.payNow} · $${amount.toLocaleString()}`}
          </button>
        </>}
        {prov==="paypal" && ppStep==="form" && (
          <div style={{textAlign:"center",paddingTop:8}}>
            <div style={{fontSize:44,marginBottom:12}}>🅿️</div>
            <div style={{fontWeight:600,marginBottom:4}}>Pay with PayPal</div>
            <div style={{color:C.sub,fontSize:13,marginBottom:20}}>You'll be redirected to complete payment.</div>
            <button className="btnP" onClick={startPP}>Continue to PayPal · ${amount.toLocaleString()}</button>
          </div>
        )}
        {prov==="paypal" && ppStep==="redirect" && (
          <div style={{textAlign:"center",padding:"32px 0"}}>
            <div style={{fontSize:28,animation:"spin 1s linear infinite",display:"inline-block",marginBottom:12}}>⟳</div>
            <div style={{color:C.sub}}>Connecting to PayPal…</div>
          </div>
        )}
        {prov==="paypal" && ppStep==="confirm" && (
          <div style={{textAlign:"center",paddingTop:8}}>
            <div style={{fontSize:44,marginBottom:12}}>✅</div>
            <div style={{fontWeight:700,fontSize:16,marginBottom:4}}>Approved</div>
            <div style={{color:C.sub,fontSize:13,marginBottom:20}}>${amount.toLocaleString()} authorized by PayPal</div>
            <button className="btnP" onClick={confirmPP} style={{opacity:busy?.6:1}}>{busy?"Confirming…":"Confirm & Dispatch"}</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TOS MODAL ───────────────────────────────────────────────
function TosModal({ onAccept, onDecline }) {
  const [scrolled, setScrolled] = useState(false);
  function onScroll(e) { if (e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight < 60) setScrolled(true); }
  const S = ({ title, children }) => (
    <div style={{marginBottom:16}}>
      <div style={{fontWeight:700,fontSize:13,color:"#E2E8F0",marginBottom:5}}>{title}</div>
      <div style={{color:"#9CA3AF",fontSize:13,lineHeight:1.7}}>{children}</div>
    </div>
  );
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:3000,padding:20}}>
      <div style={{width:"100%",maxWidth:540,background:C.surf,borderRadius:16,overflow:"hidden",maxHeight:"90vh",display:"flex",flexDirection:"column",border:`1px solid ${C.border}`}}>
        <div style={{padding:"18px 20px",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
          <div style={{fontWeight:700,fontSize:18}}>Terms of Service & User Agreement</div>
          <div style={{color:C.sub,fontSize:12,marginTop:3}}>Effective March 26, 2026 · Please read carefully</div>
        </div>
        <div onScroll={onScroll} style={{flex:1,overflowY:"auto",padding:"18px 20px",fontSize:13,lineHeight:1.7}}>
          <S title="1. Acceptance of Terms">By creating an account, you agree to be legally bound by these Terms. If you do not agree, do not register or use this Service.</S>
          <S title="2. Limitation of Liability"><strong style={{color:"#E2E8F0"}}>TO THE MAXIMUM EXTENT PERMITTED BY LAW, DISPATCH TECHNOLOGIES INC. SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES</strong>, including cargo damage or loss, delivery delays, personal injury, or property damage. Dispatch acts solely as a technology intermediary and is not a freight carrier or logistics provider.</S>
          <S title="3. No Carrier Liability">Dispatch is not responsible for: (a) loss, damage, delay or misdelivery of shipments; (b) acts or omissions of carriers or drivers; (c) incorrect information provided by users; (d) force majeure events.</S>
          <S title="4. Carrier & Driver Obligations">Drivers must hold all required licenses and insurance (valid CDL, minimum FMCSA liability coverage), comply with all DOT regulations, and maintain accurate profile information.</S>
          <S title="5. Shipper Obligations">Shippers must accurately describe cargo including weight, dimensions, and hazardous material classification. Dispatch is not responsible for undisclosed cargo.</S>
          <S title="6. Payment & Fees">Platform fees are binding upon confirmation. Fleet companies receive consolidated payments. Dispatch may withhold payments in cases of fraud or violations.</S>
          <S title="7. Indemnification">You agree to indemnify and hold harmless Dispatch Technologies Inc. from any claims arising from your use of the Service, violation of these Terms, or cargo transported using the Platform.</S>
          <S title="8. Dispute Resolution"><strong style={{color:"#E2E8F0"}}>ANY DISPUTE SHALL BE RESOLVED THROUGH BINDING ARBITRATION</strong> under AAA Commercial Rules, governed by the laws of Delaware. You waive any right to a jury trial or class action.</S>
          <S title="9. Disclaimer">THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. DISPATCH DOES NOT WARRANT UNINTERRUPTED OR ERROR-FREE SERVICE.</S>
          <S title="10. Modifications">Dispatch may modify these Terms at any time. Continued use constitutes acceptance of revised Terms.</S>
          <div style={{marginTop:16,padding:14,background:C.surf2,borderRadius:10,border:`1px solid ${C.border}`}}>
            <div style={{fontWeight:600,fontSize:13,color:C.text,marginBottom:6}}>By clicking "I Agree" you acknowledge that:</div>
            <div style={{color:C.sub,fontSize:12,lineHeight:1.6}}>
              • You have read and understand these Terms in full.<br/>
              • You are at least 18 years old and legally capable of entering this agreement.<br/>
              • Dispatch is not liable for cargo loss, damage, delays, or driver/shipper conduct.<br/>
              • Disputes will be resolved through binding arbitration.
            </div>
          </div>
        </div>
        <div style={{padding:"14px 20px",borderTop:`1px solid ${C.border}`,flexShrink:0}}>
          {!scrolled && <div style={{color:C.sub,fontSize:12,marginBottom:10}}>↓ Scroll to read all terms before accepting</div>}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <button className="btnS" onClick={onDecline} style={{fontSize:13}}>Decline</button>
            <button className="btnP" onClick={onAccept} style={{fontSize:13,opacity:scrolled?1:.4,cursor:scrolled?"pointer":"not-allowed"}} disabled={!scrolled}>✓ I Agree & Create Account</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── AUTH ─────────────────────────────────────────────────────
function Auth({ lang, onLogin }) {
  const t = T[lang];
  const [view, setView] = useState("landing");
  const [role, setRole] = useState("shipper");
  const [dType, setDType] = useState("independent");
  const [sType, setSType] = useState("individual");
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [showTos, setShowTos] = useState(false);
  const [f, setF] = useState({
    email:"",password:"",confirmPw:"",firstName:"",lastName:"",phone:"",
    companyName:"",dot:"",taxId:"",
    cdl:"",cdlState:"",cdlExpiry:"",truckMake:"",truckModel:"",truckYear:"",
    truckPlate:"",truckColor:"",truckVin:"",
    bankName:"",bankRouting:"",bankAccount:"",
    fleetName:"",fleetDot:"",fleetMc:"",fleetAddress:"",fleetContact:"",
    fleetBank:"",fleetRouting:"",fleetAcct:"",
  });
  const set = (k,v) => setF(p=>({...p,[k]:v}));

  function doLogin() {
    setBusy(true);
    setTimeout(()=>{
      setBusy(false);
      onLogin({ email:f.email, role, name:`${f.firstName} ${f.lastName}`.trim()||f.email.split("@")[0],
        sType, dType,
        company: role==="driver"&&dType==="fleet" ? f.fleetName : sType==="company" ? f.companyName : null,
        plate:f.truckPlate, truck:`${f.truckMake} ${f.truckModel}`.trim() });
    },1400);
  }
  function signIn() {
    if (!f.email||!f.password) { setErr("Fill all fields."); return; }
    setBusy(true);
    setTimeout(()=>{
      setBusy(false);
      onLogin({ email:f.email, role, name:f.email.split("@")[0], sType, dType,
        company:null, plate:"", truck:"" });
    },1200);
  }
  function next1() {
    if (!f.email||!f.password||!f.firstName||!f.lastName||!f.phone) { setErr("Fill all fields."); return; }
    if (f.password!==f.confirmPw) { setErr("Passwords don't match."); return; }
    if (!/\S+@\S+\.\S+/.test(f.email)) { setErr("Invalid email."); return; }
    setErr(""); setStep(2);
  }
  function next2() { setErr(""); setStep(3); }
  function finish() { setShowTos(true); }

  const totalSteps = role==="driver" ? 3 : 2;

  if (view==="landing") return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column"}}>
      <div style={{padding:"20px 24px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontWeight:700,fontSize:18,letterSpacing:"-.02em"}}>{t.appName}</div>
        <button onClick={()=>setView("signin")} className="btnB">{t.signIn}</button>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",padding:"40px 24px 0",maxWidth:520,margin:"0 auto",width:"100%"}}>
        <div className="fu">
          <h1 style={{fontSize:"clamp(44px,8vw,68px)",fontWeight:700,lineHeight:1.05,letterSpacing:"-.035em",marginBottom:18,whiteSpace:"pre-line"}}>{t.tagline}</h1>
          <p style={{color:C.sub,fontSize:16,lineHeight:1.6,marginBottom:28,whiteSpace:"pre-line"}}>{t.sub}</p>
          <div style={{display:"flex",gap:12}}>
            <button onClick={()=>setView("signup")} className="btnP" style={{width:"auto",padding:"15px 28px"}}>{t.getStarted}</button>
            <button onClick={()=>setView("signin")} className="btnS" style={{width:"auto",padding:"15px 22px"}}>{t.signIn}</button>
          </div>
        </div>
        <div className="fu" style={{animationDelay:".1s",display:"flex",gap:28,paddingTop:36,marginTop:36,borderTop:`1px solid ${C.border}`}}>
          {[["2,400+",t.statsDrivers],["98%",t.statsOnTime],["50 states",t.statsCoverage]].map(([n,l])=>(
            <div key={l}><div style={{fontSize:20,fontWeight:700}}>{n}</div><div style={{color:C.sub,fontSize:12,marginTop:2}}>{l}</div></div>
          ))}
        </div>
        <div className="fu" style={{animationDelay:".18s",marginTop:32,borderRadius:14,overflow:"hidden",border:`1px solid ${C.border}`}}>
          <MapView trackMode={true} height={180}/>
          <div style={{padding:"10px 14px",background:C.surf,borderTop:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:C.green,animation:"pulse 2s ease-in-out infinite"}}/>
            <span style={{fontSize:12,color:C.sub}}>{t.driversNear}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{width:"100%",maxWidth:440}}>
        <button onClick={()=>setView("landing")} style={{background:"none",border:"none",color:C.sub,fontSize:13,cursor:"pointer",marginBottom:20,padding:0}}>← {t.appName}</button>

        {view==="signin" && (
          <div className="fu">
            <h2 style={{fontSize:24,fontWeight:700,marginBottom:4,letterSpacing:"-.02em"}}>{t.welcome}</h2>
            <p style={{color:C.sub,fontSize:14,marginBottom:22}}>{t.signInSub}</p>
            <div style={{display:"flex",gap:8,marginBottom:20}}>
              {["shipper","driver"].map(r=>(
                <button key={r} onClick={()=>setRole(r)} className={`chip ${role===r?"on":""}`} style={{flex:1,justifyContent:"center",padding:"10px"}}>
                  {r==="shipper"?"📦 "+t.shipper:"🚛 "+t.driver}
                </button>
              ))}
            </div>
            <F label={t.email} type="email" value={f.email} onChange={v=>set("email",v)} placeholder="you@company.com"/>
            <F label={t.password} type="password" value={f.password} onChange={v=>set("password",v)} placeholder="••••••••"/>
            {err && <div style={{color:C.red,fontSize:13,marginBottom:10,padding:"9px 12px",background:"#1A0A0A",borderRadius:8}}>{err}</div>}
            <button className="btnP" onClick={signIn} style={{marginTop:4,opacity:busy?.6:1}}>
              {busy?<span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><span style={{animation:"spin .8s linear infinite",display:"inline-block"}}>⟳</span>Signing in…</span>:t.signIn}
            </button>
            <div style={{textAlign:"center",marginTop:18,color:C.sub,fontSize:13}}>
              {t.noAccount}{" "}<span onClick={()=>{setView("signup");setErr("");setStep(1);}} style={{color:C.text,cursor:"pointer",fontWeight:600}}>{t.createAccount}</span>
            </div>
          </div>
        )}

        {view==="signup" && (
          <div className="fu">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <h2 style={{fontSize:24,fontWeight:700,letterSpacing:"-.02em"}}>{t.createAccount}</h2>
              <div style={{display:"flex",gap:4}}>
                {Array.from({length:totalSteps}).map((_,i)=>(
                  <div key={i} style={{width:18,height:3,borderRadius:2,background:step>i?C.text:C.muted}}/>
                ))}
              </div>
            </div>
            <p style={{color:C.sub,fontSize:13,marginBottom:20}}>Step {step} of {totalSteps}</p>

            <div style={{display:"flex",gap:8,marginBottom:18}}>
              {["shipper","driver"].map(r=>(
                <button key={r} onClick={()=>{setRole(r);setStep(1);}} className={`chip ${role===r?"on":""}`} style={{flex:1,justifyContent:"center",padding:"10px"}}>
                  {r==="shipper"?"📦 "+t.shipper:"🚛 "+t.driver}
                </button>
              ))}
            </div>

            {step===1 && <>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <F label={t.firstName} value={f.firstName} onChange={v=>set("firstName",v)}/>
                <F label={t.lastName}  value={f.lastName}  onChange={v=>set("lastName",v)}/>
              </div>
              <F label={t.email}     type="email"    value={f.email}     onChange={v=>set("email",v)}     placeholder="you@company.com"/>
              <F label={t.phone}     type="tel"      value={f.phone}     onChange={v=>set("phone",v)}     placeholder="+1 (555) 000-0000"/>
              <F label={t.password}  type="password" value={f.password}  onChange={v=>set("password",v)}/>
              <F label={t.confirmPw} type="password" value={f.confirmPw} onChange={v=>set("confirmPw",v)}/>
              {role==="shipper" && <>
                <div className="lbl" style={{marginBottom:8}}>{t.shipperType}</div>
                <div style={{display:"flex",gap:8,marginBottom:14}}>
                  {["individual","company"].map(st=>(
                    <button key={st} onClick={()=>setSType(st)} className={`chip ${sType===st?"on":""}`} style={{flex:1,justifyContent:"center",padding:"10px"}}>
                      {st==="individual"?"👤 "+t.individual:"🏢 "+t.company}
                    </button>
                  ))}
                </div>
              </>}
              {role==="driver" && <>
                <div className="lbl" style={{marginBottom:8}}>{t.driverType}</div>
                <div style={{display:"flex",gap:8,marginBottom:14}}>
                  {["independent","fleet"].map(dt=>(
                    <button key={dt} onClick={()=>setDType(dt)} className={`chip ${dType===dt?"on":""}`} style={{flex:1,justifyContent:"center",padding:"10px"}}>
                      {dt==="independent"?"🚛 "+t.independent:"🏢 "+t.fleet}
                    </button>
                  ))}
                </div>
              </>}
              {err && <div style={{color:C.red,fontSize:13,marginBottom:10,padding:"9px 12px",background:"#1A0A0A",borderRadius:8}}>{err}</div>}
              <button className="btnP" onClick={next1}>{t.continueBtn}</button>
            </>}

            {step===2 && <>
              {role==="shipper" && sType==="company" && <>
                <F label={t.companyName} value={f.companyName} onChange={v=>set("companyName",v)} placeholder="Acme Logistics LLC"/>
                <F label={t.dot}         value={f.dot}         onChange={v=>set("dot",v)}         placeholder="DOT-1234567"/>
                <F label={t.taxId}       value={f.taxId}       onChange={v=>set("taxId",v)}       placeholder="12-3456789"/>
              </>}
              {role==="shipper" && sType==="individual" && (
                <div style={{background:C.surf2,borderRadius:10,padding:16,marginBottom:14}}>
                  <div style={{fontWeight:600,marginBottom:4}}>Individual account</div>
                  <div style={{color:C.sub,fontSize:13}}>No additional documents needed.</div>
                </div>
              )}
              {role==="driver" && <>
                <div style={{background:C.surf2,borderRadius:8,padding:"10px 12px",marginBottom:14,fontSize:13,color:C.sub}}>
                  <strong style={{color:C.text}}>{dType==="independent"?t.independent:t.fleet}</strong> — {dType==="independent"?t.independentNote:t.fleetNote}
                </div>
                <F label={t.cdl}      value={f.cdl}      onChange={v=>set("cdl",v)}      placeholder="CDL-A 12345678"/>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <F label={t.cdlState}  value={f.cdlState}  onChange={v=>set("cdlState",v)}  placeholder="TX"/>
                  <F label={t.cdlExpiry} type="date" value={f.cdlExpiry} onChange={v=>set("cdlExpiry",v)}/>
                </div>
                <div style={{height:1,background:C.border,margin:"4px 0 14px"}}/>
                <div className="lbl" style={{marginBottom:10}}>Truck details</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <F label={t.truckMake}  value={f.truckMake}  onChange={v=>set("truckMake",v)}  placeholder="Freightliner"/>
                  <F label={t.truckModel} value={f.truckModel} onChange={v=>set("truckModel",v)} placeholder="Cascadia"/>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <F label={t.truckYear}  value={f.truckYear}  onChange={v=>set("truckYear",v)}  placeholder="2022"/>
                  <F label={t.truckColor} value={f.truckColor} onChange={v=>set("truckColor",v)} placeholder="White"/>
                </div>
                <F label={t.truckPlate} value={f.truckPlate} onChange={v=>set("truckPlate",v)} placeholder="TX-1234-AB"/>
                <F label={t.truckVin}   value={f.truckVin}   onChange={v=>set("truckVin",v)}   placeholder="1FUJGHDV0CLBP8765"/>
                {dType==="independent" && <>
                  <div style={{height:1,background:C.border,margin:"4px 0 14px"}}/>
                  <div className="lbl" style={{marginBottom:10}}>Bank account (for payouts)</div>
                  <F label={t.bankName}    value={f.bankName}    onChange={v=>set("bankName",v)}    placeholder="Chase Bank"/>
                  <F label={t.bankRouting} value={f.bankRouting} onChange={v=>set("bankRouting",v)} placeholder="021000021"/>
                  <F label={t.bankAccount} value={f.bankAccount} onChange={v=>set("bankAccount",v)} placeholder="••••••••••"/>
                </>}
              </>}
              {err && <div style={{color:C.red,fontSize:13,marginBottom:10,padding:"9px 12px",background:"#1A0A0A",borderRadius:8}}>{err}</div>}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <button className="btnS" onClick={()=>setStep(1)}>← {t.backBtn}</button>
                {role==="driver" && dType==="fleet"
                  ? <button className="btnP" onClick={next2}>{t.continueBtn}</button>
                  : <button className="btnP" onClick={finish}>{t.reviewTerms}</button>
                }
              </div>
            </>}

            {step===3 && role==="driver" && dType==="fleet" && <>
              <div className="lbl" style={{marginBottom:10}}>Fleet company details</div>
              <F label={t.fleetName}    value={f.fleetName}    onChange={v=>set("fleetName",v)}    placeholder="Lone Star Freight LLC"/>
              <F label={t.fleetDot}     value={f.fleetDot}     onChange={v=>set("fleetDot",v)}     placeholder="DOT-9876543"/>
              <F label={t.fleetMc}      value={f.fleetMc}      onChange={v=>set("fleetMc",v)}      placeholder="MC-123456"/>
              <F label={t.fleetAddress} value={f.fleetAddress} onChange={v=>set("fleetAddress",v)} placeholder="123 Industrial Blvd, Dallas, TX"/>
              <F label={t.fleetContact} value={f.fleetContact} onChange={v=>set("fleetContact",v)} placeholder="+1 (214) 555-0100"/>
              <div style={{height:1,background:C.border,margin:"4px 0 14px"}}/>
              <div className="lbl" style={{marginBottom:10}}>Fleet bank account (receives payments)</div>
              <F label={t.bankName}    value={f.fleetBank}    onChange={v=>set("fleetBank",v)}    placeholder="Bank of America"/>
              <F label={t.bankRouting} value={f.fleetRouting} onChange={v=>set("fleetRouting",v)} placeholder="026009593"/>
              <F label={t.bankAccount} value={f.fleetAcct}    onChange={v=>set("fleetAcct",v)}    placeholder="••••••••••"/>
              {err && <div style={{color:C.red,fontSize:13,marginBottom:10,padding:"9px 12px",background:"#1A0A0A",borderRadius:8}}>{err}</div>}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <button className="btnS" onClick={()=>setStep(2)}>← {t.backBtn}</button>
                <button className="btnP" onClick={finish}>{t.reviewTerms}</button>
              </div>
            </>}

            <div style={{textAlign:"center",marginTop:18,color:C.sub,fontSize:13}}>
              {t.haveAccount}{" "}<span onClick={()=>{setView("signin");setErr("");}} style={{color:C.text,cursor:"pointer",fontWeight:600}}>{t.signIn}</span>
            </div>
          </div>
        )}
      </div>

      {showTos && (
        <TosModal
          onAccept={()=>{ setShowTos(false); doLogin(); }}
          onDecline={()=>setShowTos(false)}
        />
      )}
    </div>
  );
}

// ─── SHIPPER APP ──────────────────────────────────────────────
function ShipperApp({ user, lang, pricing, onLogout }) {
  const t = T[lang];
  const labels = CARGO[lang];
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ route:null, cargoId:null, ownTrailer:null, trailerType:null, pickupDate:"", pickupTime:"", pickupAddr:"", deliveryAddr:"", weight:"", desc:"", special:"" });
  const [showPay, setShowPay] = useState(false);
  const [searching, setSearching] = useState(false);
  const [driver, setDriver] = useState(null);
  const [stars, setStars] = useState(0);
  const [rated, setRated] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [unread, setUnread] = useState(0);
  const sf = (k,v) => setForm(p=>({...p,[k]:v}));
  const mul = form.cargoId ? pricing.mul[form.cargoId] : 1;
  const price = form.route && form.cargoId ? calcPrice(form.route.dist, mul, pricing) : 0;

  function onPaid() {
    setShowPay(false); setSearching(true);
    setTimeout(()=>{
      setDriver({ name:"James Harlow", plate:"TX-4521-AB", rating:4.8, trips:312, dType:"fleet", company:"Lone Star Freight LLC", companyDot:"DOT-7654321", truckMake:"Freightliner", truckModel:"Cascadia", truckYear:"2022", truckColor:"White" });
      setSearching(false); setStep(4);
      setTimeout(()=>setUnread(1), 8000);
    },3000);
  }
  function reset() {
    setStep(1); setForm({route:null,cargoId:null,ownTrailer:null,trailerType:null,pickupDate:"",pickupTime:"",pickupAddr:"",deliveryAddr:"",weight:"",desc:"",special:""});
    setDriver(null); setStars(0); setRated(false); setUnread(0);
  }

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"Inter,sans-serif"}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 20px",borderBottom:`1px solid ${C.border}`}}>
        <div style={{fontWeight:700,fontSize:17,letterSpacing:"-.02em"}}>{t.appName}</div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:13,fontWeight:600}}>{user.name}</div>
            <div style={{fontSize:11,color:C.sub}}>{user.company||"Individual"}</div>
          </div>
          <button onClick={onLogout} className="btnB">{t.signOut}</button>
        </div>
      </div>
      {step<4 && !searching && (
        <div style={{display:"flex",borderBottom:`1px solid ${C.border}`}}>
          {[t.selectRoute.split(" ")[0], "Details", "Pay"].map((s,i)=>(
            <div key={i} style={{flex:1,textAlign:"center",padding:"11px 0",fontSize:12,fontWeight:600,
              color:step===i+1?C.text:step>i+1?C.blue:C.sub,
              borderBottom:step===i+1?`2px solid ${C.text}`:"2px solid transparent"}}>
              {step>i+1?"✓ ":""}{s}
            </div>
          ))}
        </div>
      )}
      <div style={{maxWidth:520,margin:"0 auto",padding:"22px 20px"}}>
        {step===1 && (
          <div className="fu">
            <h2 style={{fontSize:20,fontWeight:700,marginBottom:18,letterSpacing:"-.02em"}}>{t.selectRoute}</h2>
            <div style={{marginBottom:20}}>
              {ROUTES.map(r=>(
                <div key={r.id} onClick={()=>sf("route",r)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px",marginBottom:8,borderRadius:10,cursor:"pointer",background:form.route?.id===r.id?C.surf2:"transparent",border:`1px solid ${form.route?.id===r.id?C.text:C.border}`,transition:"all .15s"}}>
                  <div><div style={{fontSize:14,fontWeight:500}}>{r.from}</div><div style={{fontSize:12,color:C.sub,marginTop:1}}>→ {r.to} · {r.dist} mi</div></div>
                  {form.route?.id===r.id && <div style={{fontWeight:700,fontSize:16}}>✓</div>}
                </div>
              ))}
            </div>
            <div className="lbl" style={{marginBottom:10}}>{t.cargoType}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:22}}>
              {Object.entries(labels).map(([id,label])=>(
                <div key={id} onClick={()=>sf("cargoId",id)} className={`tile ${form.cargoId===id?"on":""}`} style={{textAlign:"center"}}>
                  <div style={{fontSize:24,marginBottom:5}}>{CARGO_ICONS[id]}</div>
                  <div style={{fontSize:12,fontWeight:500,color:form.cargoId===id?C.text:C.sub}}>{label}</div>
                  {form.route && <div style={{fontSize:11,color:C.blue,marginTop:3,fontWeight:600}}>${calcPrice(form.route.dist,pricing.mul[id],pricing).toLocaleString()}</div>}
                </div>
              ))}
            </div>
            <button className="btnP" onClick={()=>form.route&&form.cargoId&&setStep(2)} style={{opacity:form.route&&form.cargoId?1:.4}}>{t.continueBtn}</button>
          </div>
        )}

        {step===2 && (
          <div className="fu">
            <h2 style={{fontSize:20,fontWeight:700,marginBottom:18,letterSpacing:"-.02em"}}>Trailer & Details</h2>
            <div className="lbl" style={{marginBottom:8}}>{t.trailerOwn}</div>
            <div style={{display:"flex",gap:10,marginBottom:18}}>
              {[{id:"yes",label:t.myTrailer},{id:"no",label:t.needTrailer}].map(o=>(
                <div key={o.id} onClick={()=>sf("ownTrailer",o.id)} className={`tile ${form.ownTrailer===o.id?"on":""}`} style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:500,color:form.ownTrailer===o.id?C.text:C.sub}}>{o.label}</div>
                </div>
              ))}
            </div>
            {form.ownTrailer==="no" && <>
              <div className="lbl" style={{marginBottom:8}}>{t.trailerType}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:18}}>
                {TRAILERS.map(tr=>(
                  <div key={tr.id} onClick={()=>sf("trailerType",tr.id)} className={`tile ${form.trailerType===tr.id?"on":""}`}>
                    <div style={{fontSize:18,marginBottom:4}}>{tr.icon}</div>
                    <div style={{fontSize:12,fontWeight:500,color:form.trailerType===tr.id?C.text:C.sub}}>{tr.label}</div>
                    <div style={{fontSize:11,color:C.muted,marginTop:2}}>{tr.desc}</div>
                  </div>
                ))}
              </div>
            </>}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <F label={t.pickupDate} type="date" value={form.pickupDate} onChange={v=>sf("pickupDate",v)}/>
              <F label={t.pickupTime} type="time" value={form.pickupTime} onChange={v=>sf("pickupTime",v)}/>
            </div>
            <F label={t.pickupAddr}   value={form.pickupAddr}   onChange={v=>sf("pickupAddr",v)}   placeholder="123 Main St, Houston, TX"/>
            <F label={t.deliveryAddr} value={form.deliveryAddr} onChange={v=>sf("deliveryAddr",v)} placeholder="456 Oak Ave, Dallas, TX"/>
            <F label={t.weightLbs}    value={form.weight}       onChange={v=>sf("weight",v)}       placeholder="35,000"/>
            <F label={t.cargoDesc}    value={form.desc}         onChange={v=>sf("desc",v)}         placeholder="Auto parts in pallets"/>
            <F label={t.specialInstr} value={form.special}      onChange={v=>sf("special",v)}      placeholder="Liftgate required (optional)"/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <button className="btnS" onClick={()=>setStep(1)}>← {t.backBtn}</button>
              <button className="btnP" onClick={()=>form.ownTrailer&&form.pickupDate&&form.pickupAddr&&form.deliveryAddr&&setStep(3)}>{t.continueBtn}</button>
            </div>
          </div>
        )}

        {step===3 && !searching && (
          <div className="fu">
            <h2 style={{fontSize:20,fontWeight:700,marginBottom:18,letterSpacing:"-.02em"}}>{t.reviewPay}</h2>
            <div className="card" style={{marginBottom:18}}>
              <div style={{padding:"14px 16px 0"}}>
                {[["Route",`${form.route?.from} → ${form.route?.to}`],["Distance",`${form.route?.dist} mi`],
                  ["Cargo",`${CARGO_ICONS[form.cargoId]} ${labels[form.cargoId]}`],
                  ["Trailer",form.ownTrailer==="yes"?"Your own":TRAILERS.find(x=>x.id===form.trailerType)?.label||"—"],
                  ["Pickup",`${form.pickupDate} ${form.pickupTime}`],["From",form.pickupAddr||"—"],
                  ["To",form.deliveryAddr||"—"],["Weight",form.weight?`${parseInt(form.weight).toLocaleString()} lbs`:"—"]
                ].map(([k,v])=>(
                  <div key={k} className="row"><span style={{color:C.sub,fontSize:13}}>{k}</span><span style={{fontSize:13,fontWeight:500,maxWidth:"55%",textAlign:"right"}}>{v}</span></div>
                ))}
              </div>
              <div style={{padding:16,background:C.surf2,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{fontSize:14,fontWeight:600}}>{t.totalLabel}</div><div style={{fontSize:11,color:C.sub,marginTop:1}}>{t.fixedRate}</div></div>
                <div style={{fontSize:26,fontWeight:700,letterSpacing:"-.02em"}}>${price.toLocaleString()}</div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <button className="btnS" onClick={()=>setStep(2)}>← {t.backBtn}</button>
              <button className="btnP" onClick={()=>setShowPay(true)}>{t.dispatchBtn}</button>
            </div>
          </div>
        )}

        {searching && (
          <div style={{textAlign:"center",padding:"80px 0"}} className="fi">
            <div style={{width:52,height:52,borderRadius:"50%",background:C.surf2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,margin:"0 auto 18px",animation:"pulse 1.5s ease-in-out infinite"}}>🚛</div>
            <div style={{fontSize:17,fontWeight:700,marginBottom:6}}>{t.findingDriver}</div>
            <div style={{color:C.sub,fontSize:13}}>{t.checkingDrivers}</div>
          </div>
        )}

        {step===4 && driver && (
          <div className="fu">
            <div style={{borderRadius:14,overflow:"hidden",marginBottom:18,border:`1px solid ${C.border}`}}>
              <MapView trackMode={true} height={220}/>
              <div style={{padding:"10px 14px",background:C.surf,borderTop:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{display:"flex",alignItems:"center",gap:7}}>
                  <div style={{width:7,height:7,borderRadius:"50%",background:C.green,animation:"pulse 2s ease-in-out infinite"}}/>
                  <span style={{fontSize:12,color:C.sub}}>{t.liveTracking}</span>
                </div>
                <button onClick={()=>{setUnread(0);setShowChat(true);}} style={{position:"relative",background:C.surf2,border:`1px solid ${C.border}`,borderRadius:20,padding:"5px 14px",fontSize:13,cursor:"pointer",color:C.text}}>
                  💬 {t.messageBtn}
                  {unread>0 && <span style={{position:"absolute",top:-4,right:-4,width:16,height:16,borderRadius:"50%",background:C.red,fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{unread}</span>}
                </button>
              </div>
            </div>
            <div className="card" style={{marginBottom:14}}>
              {driver.dType==="fleet" && driver.company && (
                <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,background:C.surf2,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div className="lbl" style={{marginBottom:3}}>{t.fleetCo}</div>
                    <div style={{fontWeight:600,fontSize:14}}>{driver.company}</div>
                    <div style={{color:C.sub,fontSize:12,marginTop:1}}>{driver.companyDot}</div>
                  </div>
                  <span className="tag" style={{background:"rgba(39,110,241,.12)",color:C.blue}}>{t.fleetTag}</span>
                </div>
              )}
              <div style={{padding:"14px 16px",borderBottom:`1px solid ${C.border}`}}>
                <div className="lbl" style={{marginBottom:8}}>{t.driverLabel}</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",gap:10,alignItems:"center"}}>
                    <div style={{width:44,height:44,borderRadius:"50%",background:C.surf2,display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${C.border}`,fontSize:20}}>🚛</div>
                    <div>
                      <div style={{fontWeight:600,fontSize:15}}>{driver.name}</div>
                      <div style={{color:C.sub,fontSize:12,marginTop:1}}>CDL-A · {driver.plate}</div>
                      <Stars rating={driver.rating} size={12}/>
                    </div>
                  </div>
                  <span className="tag" style={{background:driver.dType==="fleet"?"rgba(255,192,67,.1)":"rgba(5,148,79,.1)",color:driver.dType==="fleet"?C.amber:C.green}}>
                    {driver.dType==="fleet"?t.fleetDriver:t.indepDriver}
                  </span>
                </div>
              </div>
              <div style={{padding:"14px 16px"}}>
                <div className="lbl" style={{marginBottom:8}}>{t.truckLabel}</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {[["Make/Model",`${driver.truckMake} ${driver.truckModel}`],["Year",driver.truckYear],["Plate",driver.plate],["Color",driver.truckColor]].map(([l,v])=>(
                    <div key={l}><div style={{color:C.sub,fontSize:11}}>{l}</div><div style={{fontSize:13,fontWeight:500,marginTop:1}}>{v}</div></div>
                  ))}
                </div>
              </div>
              <div style={{background:C.surf2,padding:"12px 16px",borderTop:`1px solid ${C.border}`,display:"grid",gridTemplateColumns:"1fr 1fr 1fr"}}>
                {[["67 mph",t.speed],["I-45 N",t.locLabel],["1h 48m",t.eta]].map(([v,l])=>(
                  <div key={l} style={{textAlign:"center"}}>
                    <div style={{fontSize:16,fontWeight:700}}>{v}</div>
                    <div style={{color:C.sub,fontSize:11,marginTop:2}}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
            {!rated ? (
              <div className="card" style={{padding:18}}>
                <div style={{fontWeight:600,marginBottom:3}}>{t.rateExp}</div>
                <div style={{color:C.sub,fontSize:13,marginBottom:14}}>{t.howWas}</div>
                <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:14}}>
                  {[1,2,3,4,5].map(s=>(
                    <span key={s} onClick={()=>setStars(s)} style={{fontSize:34,cursor:"pointer",color:s<=stars?C.amber:C.muted,transition:"color .15s"}}>★</span>
                  ))}
                </div>
                {stars>0 && <button className="btnP" onClick={()=>setRated(true)}>{t.submitRating}</button>}
              </div>
            ) : (
              <div style={{textAlign:"center",padding:"28px 0"}} className="fu">
                <div style={{fontSize:44,marginBottom:14}}>⭐</div>
                <div style={{fontSize:18,fontWeight:700,marginBottom:5}}>{t.thanksMsg}</div>
                <div style={{color:C.sub,fontSize:13,marginBottom:22}}>{t.reviewSaved}</div>
                <button className="btnP" onClick={reset}>{t.newShipment}</button>
              </div>
            )}
          </div>
        )}
      </div>
      {showPay && <Payment amount={price} t={t} onSuccess={onPaid} onCancel={()=>setShowPay(false)}/>}
      {showChat && driver && <Chat myName={user.name} otherName={driver.name} onClose={()=>setShowChat(false)} t={t}/>}
    </div>
  );
}

// ─── DRIVER APP ───────────────────────────────────────────────
function DriverApp({ user, lang, pricing, onLogout, incomingJob }) {
  const t = T[lang];
  const [status, setStatus] = useState("available");
  const [job, setJob] = useState(null);
  const [step, setStep] = useState("idle");
  const [cd, setCd] = useState(180);
  const [earnings, setEarnings] = useState({ d:3200, w:18400, tot:127800 });
  const [showChat, setShowChat] = useState(false);
  const [unread, setUnread] = useState(0);
  const [pickupPic, setPickupPic] = useState(null);
  const [delivPic, setDelivPic] = useState(null);
  const tmr = useRef(null);

  useEffect(()=>{
    if (incomingJob && status==="available" && step==="idle") {
      const pay = Math.round(incomingJob.price*(pricing.driverCut/100)/50)*50;
      setJob({...incomingJob,pay}); setStep("incoming"); setCd(180);
    }
  },[incomingJob]);

  useEffect(()=>{
    if (step==="incoming") {
      tmr.current = setInterval(()=>setCd(c=>{ if(c<=1){clearInterval(tmr.current);setStep("idle");setJob(null);return 0;} return c-1; }),1000);
    } else clearInterval(tmr.current);
    return()=>clearInterval(tmr.current);
  },[step]);

  function accept(){ clearInterval(tmr.current); setStep("active"); setStatus("busy"); setTimeout(()=>setUnread(1),12000); }
  function decline(){ setStep("idle"); setJob(null); }
  function complete(){ setStep("done"); setEarnings(p=>({...p,d:p.d+(job?.pay||0),tot:p.tot+(job?.pay||0)})); }
  function resetD(){ setStep("idle"); setJob(null); setStatus("available"); setPickupPic(null); setDelivPic(null); setUnread(0); }

  const pct = ((180-cd)/180)*100;
  const mins = Math.floor(cd/60), secs = cd%60;
  const payInfo = user.dType==="fleet"
    ? { label:t.paymentTo, name:user.company||"Fleet Company", note:t.employerPayroll }
    : { label:t.paymentTo, name:"Your bank account", note:t.directDeposit };

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"Inter,sans-serif"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 20px",borderBottom:`1px solid ${C.border}`}}>
        <div style={{fontWeight:700,fontSize:17,letterSpacing:"-.02em"}}>{t.appName}</div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button onClick={()=>setStatus(s=>s==="available"?"offline":"available")} style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:20,padding:"6px 14px",fontSize:13,fontWeight:600,cursor:"pointer",color:{available:C.green,busy:C.blue,offline:C.sub}[status]||C.sub,display:"flex",alignItems:"center",gap:6}}>
            <span style={{width:7,height:7,borderRadius:"50%",background:{available:C.green,busy:C.blue,offline:C.sub}[status],display:"inline-block"}}/>
            {status==="available"?t.available:status==="busy"?t.onTrip:t.offline}
          </button>
          <button onClick={onLogout} className="btnB">{t.signOut}</button>
        </div>
      </div>
      <div style={{maxWidth:480,margin:"0 auto",padding:"18px 20px"}}>
        {/* Driver identity card */}
        <div className="card" style={{marginBottom:14}}>
          {user.dType==="fleet" && user.company && (
            <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`,background:C.surf2,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><div style={{color:C.sub,fontSize:11,marginBottom:1}}>{t.fleetCo}</div><div style={{fontWeight:600,fontSize:13}}>{user.company}</div></div>
              <span className="tag" style={{background:"rgba(39,110,241,.12)",color:C.blue}}>{t.fleetTag}</span>
            </div>
          )}
          <div style={{padding:"12px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              <div style={{width:38,height:38,borderRadius:"50%",background:C.surf2,display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${C.border}`,fontSize:17}}>🚛</div>
              <div>
                <div style={{fontWeight:600,fontSize:14}}>{user.name}</div>
                <div style={{color:C.sub,fontSize:12,marginTop:1}}>{user.plate||"—"} · {user.truck||"—"}</div>
              </div>
            </div>
            <span className="tag" style={{background:user.dType==="fleet"?"rgba(255,192,67,.1)":"rgba(5,148,79,.1)",color:user.dType==="fleet"?C.amber:C.green}}>
              {user.dType==="fleet"?t.fleetDriver:t.indepDriver}
            </span>
          </div>
        </div>
        {/* Earnings */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
          {[[t.todayEarnings,`$${earnings.d.toLocaleString()}`],[t.weekEarnings,`$${(earnings.w+earnings.d-3200).toLocaleString()}`],[t.totalEarnings,`$${earnings.tot.toLocaleString()}`]].map(([l,v])=>(
            <div key={l} style={{background:C.surf,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 10px"}}>
              <div style={{color:C.sub,fontSize:10,fontWeight:500,marginBottom:3}}>{l}</div>
              <div style={{fontSize:15,fontWeight:700,letterSpacing:"-.02em"}}>{v}</div>
            </div>
          ))}
        </div>
        {/* Payment routing */}
        <div style={{background:C.surf,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 14px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{color:C.sub,fontSize:11}}>{payInfo.label}</div>
            <div style={{fontSize:13,fontWeight:600,marginTop:1}}>{payInfo.name}</div>
            <div style={{color:C.sub,fontSize:11,marginTop:1}}>{payInfo.note}</div>
          </div>
          <div style={{fontSize:20}}>💳</div>
        </div>
        {/* Map */}
        <div style={{borderRadius:12,overflow:"hidden",marginBottom:16,border:`1px solid ${C.border}`}}>
          <MapView trackMode={step==="active"} height={180}/>
        </div>

        {step==="idle" && (
          <div className="fu">
            <div style={{background:C.surf,border:`1px solid ${C.border}`,borderRadius:14,padding:22,textAlign:"center",marginBottom:14}}>
              <div style={{fontSize:36,marginBottom:10}}>🚛</div>
              <div style={{fontWeight:600,fontSize:16,marginBottom:4}}>{t.readyJobs}</div>
              <div style={{color:C.sub,fontSize:13,lineHeight:1.5}}>{t.waitNote}</div>
            </div>
            <div>
              <div className="lbl" style={{marginBottom:10}}>{t.todayJobs}</div>
              {[{from:"Chicago",to:"Detroit",cargo:"Cold Chain",price:3840},{from:"Detroit",to:"Cleveland",cargo:"General",price:2650}].map((trip,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"13px 0",borderBottom:`1px solid ${C.border}`}}>
                  <div><div style={{fontSize:14,fontWeight:500}}>{trip.from} → {trip.to}</div><div style={{color:C.sub,fontSize:12,marginTop:1}}>{trip.cargo}</div></div>
                  <div style={{fontSize:15,fontWeight:700}}>${trip.price.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step==="incoming" && job && (
          <div className="su">
            <div className="card">
              <div style={{padding:"14px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{fontWeight:700,fontSize:15}}>{t.newJobOffer}</div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <svg width={44} height={44} viewBox="0 0 44 44" style={{transform:"rotate(-90deg)"}}>
                    <circle cx={22} cy={22} r={18} fill="none" stroke={C.border} strokeWidth={3}/>
                    <circle cx={22} cy={22} r={18} fill="none" stroke={C.text} strokeWidth={3} strokeDasharray="113" strokeDashoffset={113*(pct/100)} strokeLinecap="round" style={{transition:"stroke-dashoffset 1s linear"}}/>
                  </svg>
                  <span style={{fontSize:13,fontWeight:700,fontFamily:"monospace",color:C.sub}}>{mins}:{String(secs).padStart(2,"0")}</span>
                </div>
              </div>
              <div style={{padding:"16px 16px 8px"}}>
                <div style={{color:C.sub,fontSize:11,marginBottom:4}}>{t.yourPayout} ({pricing.driverCut}%)</div>
                <div style={{fontSize:34,fontWeight:700,letterSpacing:"-.03em",marginBottom:4}}>${job.pay?.toLocaleString()}</div>
                <div style={{fontSize:12,color:C.sub}}>{user.dType==="fleet"?`Goes to ${user.company||"fleet"} · Total $${job.price?.toLocaleString()}`:`${t.directBank} · Total $${job.price?.toLocaleString()}`}</div>
              </div>
              <div style={{padding:"4px 16px"}}>
                {[[t.routeLabel,`${job.route?.from||""} → ${job.route?.to||""}`],[t.cargoType,job.cargo?.label||""],[t.distLabel,`${job.route?.dist||0} mi`],[t.pickupLabel,"Today"]].map(([l,v])=>(
                  <div key={l} className="row"><span style={{color:C.sub,fontSize:13}}>{l}</span><span style={{fontSize:13,fontWeight:500}}>{v}</span></div>
                ))}
              </div>
              <div style={{padding:14,display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <button className="btnS" onClick={decline}>{t.backBtn}</button>
                <button className="btnP" onClick={accept}>{t.continueBtn}</button>
              </div>
            </div>
          </div>
        )}

        {step==="active" && job && (
          <div className="fu">
            <div className="card" style={{marginBottom:12}}>
              <div style={{padding:"14px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontWeight:700,fontSize:15}}>{job.route?.from} → {job.route?.to}</div>
                  <div style={{color:C.sub,fontSize:12,marginTop:2}}>{job.cargo?.label}</div>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <button onClick={()=>{setUnread(0);setShowChat(true);}} style={{position:"relative",background:C.surf2,border:`1px solid ${C.border}`,borderRadius:20,padding:"5px 12px",fontSize:13,cursor:"pointer",color:C.text}}>
                    💬
                    {unread>0 && <span style={{position:"absolute",top:-4,right:-4,width:15,height:15,borderRadius:"50%",background:C.red,fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{unread}</span>}
                  </button>
                  <span style={{fontSize:11,padding:"3px 10px",borderRadius:10,background:C.surf2,color:C.blue,border:`1px solid ${C.border}`,fontWeight:600}}>{t.onTrip}</span>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",padding:"14px 16px",borderBottom:`1px solid ${C.border}`}}>
                {[["74 mph",t.speed],["149 mi",t.remaining],["2h 31m",t.eta]].map(([v,l])=>(
                  <div key={l} style={{textAlign:"center"}}>
                    <div style={{fontSize:17,fontWeight:700}}>{v}</div>
                    <div style={{color:C.sub,fontSize:11,marginTop:2}}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
                  <span style={{color:C.sub,fontSize:12}}>{t.progressLabel}</span>
                  <span style={{fontSize:12,fontWeight:600}}>29%</span>
                </div>
                <div style={{background:C.surf2,borderRadius:4,height:4}}>
                  <div style={{width:"29%",height:"100%",background:C.text,borderRadius:4}}/>
                </div>
              </div>
              <div style={{padding:14,display:"flex",flexDirection:"column",gap:8}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  <button onClick={()=>setStep("pickup_photo")} style={{padding:"10px",borderRadius:8,border:`1px solid ${pickupPic?C.green:C.border}`,background:pickupPic?`${C.green}10`:C.surf2,cursor:"pointer",color:pickupPic?C.green:C.sub,fontSize:13,fontWeight:500,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                    {pickupPic?"✅":"📷"} {t.pickupPhoto}
                  </button>
                  <button onClick={()=>setStep("deliv_photo")} style={{padding:"10px",borderRadius:8,border:`1px solid ${delivPic?C.green:C.border}`,background:delivPic?`${C.green}10`:C.surf2,cursor:"pointer",color:delivPic?C.green:C.sub,fontSize:13,fontWeight:500,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                    {delivPic?"✅":"📷"} {t.deliveryPhoto}
                  </button>
                </div>
                <button className="btnP" onClick={()=>setStep("deliv_photo")}>{t.completeDelivery}</button>
              </div>
            </div>
            <div className="card" style={{padding:14}}>
              <div className="lbl" style={{marginBottom:8}}>Shipper</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{fontWeight:500,fontSize:14}}>ABC Logistics Inc.</div><div style={{color:C.sub,fontSize:12,marginTop:1}}>+1 (713) 555-0100</div></div>
                <button onClick={()=>setShowChat(true)} style={{background:C.surf2,border:`1px solid ${C.border}`,borderRadius:8,padding:"7px 14px",fontSize:13,cursor:"pointer",color:C.text}}>💬 Chat</button>
              </div>
            </div>
          </div>
        )}

        {step==="pickup_photo" && (
          <div className="fu">
            <h3 style={{fontSize:17,fontWeight:700,marginBottom:14}}>{t.pickupVerifyTitle}</h3>
            <Camera title={t.pickupVerifyTitle} sub={t.pickupVerifySub} t={t} onCapture={img=>{setPickupPic(img);setStep("active");}} onSkip={()=>setStep("active")}/>
          </div>
        )}

        {step==="deliv_photo" && (
          <div className="fu">
            <h3 style={{fontSize:17,fontWeight:700,marginBottom:14}}>{t.deliveryVerifyTitle}</h3>
            <Camera title={t.deliveryVerifyTitle} sub={t.deliveryVerifySub} t={t}
              onCapture={img=>{ setDelivPic(img); complete(); }}
              onSkip={()=>complete()}/>
          </div>
        )}

        {step==="done" && (
          <div style={{textAlign:"center",padding:"52px 0"}} className="fu">
            <div style={{fontSize:44,marginBottom:16}}>💰</div>
            <div style={{fontSize:36,fontWeight:700,letterSpacing:"-.03em",marginBottom:6}}>+${job?.pay?.toLocaleString()}</div>
            <div style={{color:C.sub,fontSize:14,marginBottom:4}}>{user.dType==="fleet"?t.paidFleet:t.paidBank}</div>
            {(pickupPic||delivPic) && (
              <div style={{display:"flex",gap:10,justifyContent:"center",marginTop:14,marginBottom:6}}>
                {pickupPic && <img src={pickupPic} alt="p" style={{width:80,height:60,borderRadius:8,objectFit:"cover",border:`1px solid ${C.border}`}}/>}
                {delivPic  && <img src={delivPic}  alt="d" style={{width:80,height:60,borderRadius:8,objectFit:"cover",border:`1px solid ${C.border}`}}/>}
              </div>
            )}
            <div style={{color:C.sub,fontSize:12,marginBottom:24}}>
              {pickupPic&&delivPic?"Both photos verified ✅":pickupPic?"Pickup photo ✅":delivPic?"Delivery photo ✅":""}
            </div>
            <button className="btnP" onClick={resetD} style={{maxWidth:240,margin:"0 auto"}}>{t.findNextJob}</button>
          </div>
        )}
      </div>
      {showChat && <Chat myName={user.name} otherName="Shipper" onClose={()=>setShowChat(false)} t={t}/>}
    </div>
  );
}

// ─── ADMIN ────────────────────────────────────────────────────
function AdminLogin({ onSuccess }) {
  const [pw, setPw] = useState(""); const [err, setErr] = useState("");
  function try_() { if (pw===ADMIN_PASS) onSuccess(); else { setErr("Incorrect password."); setPw(""); } }
  return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"Inter,sans-serif"}}>
      <div style={{width:"100%",maxWidth:360}}>
        <div style={{fontWeight:700,fontSize:17,marginBottom:28}}>Dispatch · Admin</div>
        <F label="Admin password" type="password" value={pw} onChange={setPw} placeholder="••••••••"/>
        {err && <div style={{color:C.red,fontSize:13,marginBottom:10}}>{err}</div>}
        <button className="btnP" onClick={try_} onKeyDown={e=>e.key==="Enter"&&try_()}>Enter admin panel</button>
      </div>
    </div>
  );
}

function AdminDashboard({ pricing, setPricing, onExit }) {
  const [tab, setTab] = useState("pricing");
  const [drivers, setDrivers] = useState([
    {id:1,name:"James Harlow", plate:"TX-4521-AB",rating:4.8,trips:312,earnings:127800,status:"available",dType:"fleet",  company:"Lone Star Freight LLC"},
    {id:2,name:"Carlos Rivera",plate:"CA-8873-KT",rating:4.6,trips:189,earnings:98400, status:"available",dType:"independent",company:null},
    {id:3,name:"David Chen",   plate:"FL-2210-HL",rating:4.9,trips:541,earnings:214600,status:"busy",     dType:"fleet",  company:"Pacific Haulers Inc."},
    {id:4,name:"Marco Santos", plate:"TX-5543-MR",rating:4.7,trips:278,earnings:115300,status:"available",dType:"independent",company:null},
  ]);
  const [users, setUsers] = useState(INIT_USERS);
  const [userFilter, setUserFilter] = useState("all");
  const [draft, setDraft] = useState({...pricing, mul:{...pricing.mul}});
  const [saved, setSaved] = useState(false);
  const [violation, setViolation] = useState(null);
  const [vText, setVText] = useState("");
  const [vSent, setVSent] = useState(false);
  const [blacklistTarget, setBlacklistTarget] = useState(null);

  function save() { setPricing({...draft,mul:{...draft.mul}}); setSaved(true); setTimeout(()=>setSaved(false),2000); }
  function adj(k,d,min=0,max=9999){ setDraft(p=>({...p,[k]:Math.min(max,Math.max(min,+(p[k]+d).toFixed(2)))})); }
  function adjMul(k,d){ setDraft(p=>({...p,mul:{...p.mul,[k]:Math.min(3,Math.max(1,+(p.mul[k]+d).toFixed(1)))}})); }
  function toggleDrv(id){ setDrivers(prev=>prev.map(d=>d.id!==id?d:{...d,status:d.status==="available"?"offline":"available"})); }
  function issueViolation(u){ setViolation(u); setVText(""); setVSent(false); }
  function sendViolation(){ if(!vText.trim()) return; setUsers(prev=>prev.map(u=>u.id===violation.id?{...u,violations:u.violations+1}:u)); setVSent(true); }
  function blacklist(u){ setBlacklistTarget(u); }
  function confirmBlacklist(){ setUsers(prev=>prev.map(u=>u.id===blacklistTarget.id?{...u,blacklisted:true}:u)); setBlacklistTarget(null); }
  function unblock(id){ setUsers(prev=>prev.map(u=>u.id===id?{...u,blacklisted:false}:u)); }

  const maxRev = Math.max(...REVENUE.map(r=>r.rev));
  const filtered = users.filter(u=>{
    if(userFilter==="driver")      return u.role==="driver";
    if(userFilter==="shipper")     return u.role==="shipper";
    if(userFilter==="blacklisted") return u.blacklisted;
    if(userFilter==="violations")  return u.violations>0;
    return true;
  });

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"Inter,sans-serif"}}>
      <div style={{borderBottom:`1px solid ${C.border}`,padding:"16px 24px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontWeight:700,fontSize:17}}>Dispatch · Admin</div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {[["Available",drivers.filter(d=>d.status==="available").length,C.green],["On trip",drivers.filter(d=>d.status==="busy").length,C.blue],["Jobs",LIVE_TRIPS.length,C.sub]].map(([l,v,c])=>(
            <div key={l} style={{fontSize:13,color:C.sub,padding:"4px 12px",background:C.surf,borderRadius:20,border:`1px solid ${C.border}`}}>
              <span style={{color:c,fontWeight:700}}>{v}</span> {l}
            </div>
          ))}
          <button onClick={onExit} className="btnB">Exit</button>
        </div>
      </div>
      <div style={{display:"flex",borderBottom:`1px solid ${C.border}`,padding:"0 24px",overflowX:"auto"}}>
        {[{id:"pricing",label:"Pricing"},{id:"drivers",label:"Drivers"},{id:"trips",label:"Live Trips"},{id:"revenue",label:"Revenue"},{id:"users",label:"Users"}].map(tb=>(
          <button key={tb.id} onClick={()=>setTab(tb.id)} style={{background:"none",border:"none",padding:"13px 16px",fontSize:13,cursor:"pointer",fontFamily:"Inter,sans-serif",fontWeight:500,whiteSpace:"nowrap",color:tab===tb.id?C.text:C.sub,borderBottom:tab===tb.id?`2px solid ${C.text}`:"2px solid transparent",marginBottom:-1}}>
            {tb.label}
          </button>
        ))}
      </div>
      <div style={{maxWidth:860,margin:"0 auto",padding:"24px"}}>

        {tab==="pricing" && (
          <div className="fu">
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:24}}>
              {[{label:"Base Rate ($)",key:"baseRate",step:50},{label:"Rate/Mile ($/mi)",key:"perMile",step:.25,max:20},{label:"Driver Cut (%)",key:"driverCut",step:1,min:50,max:95}].map(({label,key,step,min=0,max=9999})=>(
                <div key={key} style={{background:C.surf,border:`1px solid ${C.border}`,borderRadius:12,padding:16}}>
                  <div className="lbl" style={{marginBottom:10}}>{label}</div>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <button onClick={()=>adj(key,-step,min,max)} style={{width:34,height:34,borderRadius:8,border:`1px solid ${C.border}`,background:C.surf2,color:C.text,fontSize:20,cursor:"pointer"}}>−</button>
                    <span style={{flex:1,textAlign:"center",fontSize:22,fontWeight:700,letterSpacing:"-.02em"}}>{draft[key]}</span>
                    <button onClick={()=>adj(key,+step,min,max)} style={{width:34,height:34,borderRadius:8,border:`1px solid ${C.border}`,background:C.surf2,color:C.text,fontSize:20,cursor:"pointer"}}>+</button>
                  </div>
                </div>
              ))}
              <div style={{background:C.surf,border:`1px solid ${C.border}`,borderRadius:12,padding:16,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center"}}>
                <div className="lbl" style={{marginBottom:6}}>Platform Cut</div>
                <div style={{fontSize:34,fontWeight:700,letterSpacing:"-.03em"}}>{100-draft.driverCut}%</div>
              </div>
            </div>
            <div className="lbl" style={{marginBottom:12}}>Cargo Multipliers</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:22}}>
              {Object.entries(draft.mul).map(([key,val])=>(
                <div key={key} style={{background:C.surf,border:`1px solid ${C.border}`,borderRadius:10,padding:14}}>
                  <div style={{fontSize:12,color:C.sub,marginBottom:8}}>{CARGO_ICONS[key]} {key.charAt(0).toUpperCase()+key.slice(1)}</div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <button onClick={()=>adjMul(key,-.1)} style={{width:28,height:28,borderRadius:6,border:`1px solid ${C.border}`,background:C.surf2,color:C.text,fontSize:16,cursor:"pointer"}}>−</button>
                    <span style={{flex:1,textAlign:"center",fontSize:17,fontWeight:700}}>×{val.toFixed(1)}</span>
                    <button onClick={()=>adjMul(key,+.1)} style={{width:28,height:28,borderRadius:6,border:`1px solid ${C.border}`,background:C.surf2,color:C.text,fontSize:16,cursor:"pointer"}}>+</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="card" style={{padding:18,marginBottom:20}}>
              <div className="lbl" style={{marginBottom:14}}>Price preview · Houston → Dallas (239 mi)</div>
              {Object.entries(draft.mul).map(([key,mul])=>{
                const total=calcPrice(239,mul,draft); const dp=Math.round(total*draft.driverCut/100/50)*50;
                return (
                  <div key={key} className="row">
                    <span style={{color:C.sub,fontSize:13}}>{CARGO_ICONS[key]} {key}</span>
                    <div style={{display:"flex",gap:18,fontSize:13}}>
                      <span style={{fontWeight:600}}>${total.toLocaleString()}</span>
                      <span style={{color:C.green}}>Fleet ${dp.toLocaleString()}</span>
                      <span style={{color:C.sub}}>Platform ${(total-dp).toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <button className="btnP" onClick={save} style={{background:saved?C.green:C.text}}>{saved?"✓ Saved":"Save configuration"}</button>
          </div>
        )}

        {tab==="drivers" && (
          <div className="fu">
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:22}}>
              {[["Available",drivers.filter(d=>d.status==="available").length,C.green],["On trip",drivers.filter(d=>d.status==="busy").length,C.blue],["Offline",drivers.filter(d=>d.status==="offline").length,C.sub]].map(([l,c,col])=>(
                <div key={l} style={{background:C.surf,border:`1px solid ${C.border}`,borderRadius:12,padding:"16px 14px"}}>
                  <div style={{fontSize:30,fontWeight:700,color:col}}>{c}</div>
                  <div style={{color:C.sub,fontSize:13,marginTop:3}}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {drivers.map(drv=>(
                <div key={drv.id} style={{background:C.surf,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden"}}>
                  {drv.company && <div style={{padding:"8px 14px",background:C.surf2,borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{fontSize:12,color:C.sub,fontWeight:500}}>{drv.company}</div>
                    <span className="tag" style={{background:"rgba(39,110,241,.1)",color:C.blue,fontSize:10}}>Fleet</span>
                  </div>}
                  <div style={{padding:14}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <div style={{width:36,height:36,borderRadius:"50%",background:C.surf2,display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${C.border}`,fontSize:16}}>🚛</div>
                        <div>
                          <div style={{fontWeight:600,fontSize:13}}>{drv.name}</div>
                          <div style={{color:C.sub,fontSize:11,marginTop:1}}>{drv.plate}</div>
                          <Stars rating={drv.rating} size={11}/>
                        </div>
                      </div>
                      <span style={{fontSize:10,padding:"3px 8px",borderRadius:8,background:C.surf2,color:drv.status==="available"?C.green:drv.status==="busy"?C.blue:C.sub,border:`1px solid ${C.border}`,fontWeight:600}}>
                        {drv.status==="available"?"● Avail":drv.status==="busy"?"● Trip":"○ Off"}
                      </span>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:10}}>
                      {[["Trips",drv.trips],["Rating",drv.rating],["Earned",`$${(drv.earnings/1000).toFixed(0)}k`]].map(([l,v])=>(
                        <div key={l} style={{background:C.surf2,borderRadius:6,padding:"7px 6px",textAlign:"center"}}>
                          <div style={{color:C.sub,fontSize:9}}>{l}</div>
                          <div style={{fontSize:13,fontWeight:700}}>{v}</div>
                        </div>
                      ))}
                    </div>
                    {drv.status!=="busy" && <button onClick={()=>toggleDrv(drv.id)} style={{width:"100%",padding:8,borderRadius:7,border:`1px solid ${C.border}`,background:"transparent",color:drv.status==="available"?C.red:C.green,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>
                      {drv.status==="available"?"Set offline":"Set available"}
                    </button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==="trips" && (
          <div className="fu">
            <div style={{borderRadius:12,overflow:"hidden",marginBottom:18,border:`1px solid ${C.border}`}}><MapView trackMode={true} height={180}/></div>
            {LIVE_TRIPS.map(trip=>(
              <div key={trip.id} style={{background:C.surf,border:`1px solid ${C.border}`,borderRadius:12,marginBottom:10,overflow:"hidden"}}>
                {trip.company && <div style={{padding:"7px 14px",background:C.surf2,borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between"}}>
                  <span style={{fontSize:12,color:C.sub}}>{trip.company}</span>
                  <span className="tag" style={{background:"rgba(39,110,241,.1)",color:C.blue,fontSize:10}}>Fleet payment</span>
                </div>}
                <div style={{padding:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <div>
                      <div style={{color:C.sub,fontSize:11,marginBottom:2}}>{trip.id} · {trip.driver}</div>
                      <div style={{fontWeight:600,fontSize:14}}>{trip.from} → {trip.to}</div>
                      <div style={{color:C.sub,fontSize:12,marginTop:1}}>{trip.cargo}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontWeight:700,fontSize:16}}>${trip.price.toLocaleString()}</div>
                      <div style={{color:C.sub,fontSize:11,marginTop:1}}>{trip.pct}%</div>
                    </div>
                  </div>
                  <div style={{background:C.surf2,borderRadius:4,height:4}}>
                    <div style={{width:`${trip.pct}%`,height:"100%",background:C.text,borderRadius:4}}/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab==="revenue" && (
          <div className="fu">
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:22}}>
              {[["Total Revenue (6mo)",`$${(REVENUE.reduce((s,r)=>s+r.rev,0)/1000).toFixed(0)}k`],
                ["Platform Commission",`$${(REVENUE.reduce((s,r)=>s+r.com,0)/1000).toFixed(0)}k`],
                ["Fleet Payouts",`$${(REVENUE.reduce((s,r)=>s+r.pay,0)/1000).toFixed(0)}k`],
                ["Commission Rate",`${100-pricing.driverCut}%`]].map(([l,v])=>(
                <div key={l} style={{background:C.surf,border:`1px solid ${C.border}`,borderRadius:12,padding:16}}>
                  <div className="lbl" style={{marginBottom:6}}>{l}</div>
                  <div style={{fontSize:26,fontWeight:700,letterSpacing:"-.02em"}}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{background:C.surf,border:`1px solid ${C.border}`,borderRadius:12,padding:18,marginBottom:18}}>
              <div className="lbl" style={{marginBottom:14}}>Monthly</div>
              <div style={{display:"flex",alignItems:"flex-end",gap:8,height:90,marginBottom:9}}>
                {REVENUE.map(r=>(
                  <div key={r.m} style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"flex-end",gap:2}}>
                    <div style={{background:C.text,borderRadius:"3px 3px 0 0",height:`${(r.com/maxRev)*100}%`,opacity:.35,minHeight:3}}/>
                    <div style={{background:C.text,height:`${(r.pay/maxRev)*100}%`,opacity:.1,minHeight:3}}/>
                  </div>
                ))}
              </div>
              <div style={{display:"flex"}}>
                {REVENUE.map(r=><div key={r.m} style={{flex:1,textAlign:"center",color:C.sub,fontSize:11}}>{r.m}</div>)}
              </div>
            </div>
            <div style={{background:C.surf,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",padding:"10px 14px",borderBottom:`1px solid ${C.border}`,background:C.surf2}}>
                {["Month","Revenue","Fleet payout","Commission"].map(h=><div key={h} className="lbl">{h}</div>)}
              </div>
              {REVENUE.map(r=>(
                <div key={r.m} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",padding:"12px 14px",borderBottom:`1px solid ${C.border}`}}>
                  <div style={{color:C.sub,fontSize:13}}>{r.m}</div>
                  <div style={{fontSize:13,fontWeight:600}}>${(r.rev/1000).toFixed(1)}k</div>
                  <div style={{fontSize:13,fontWeight:600}}>${(r.pay/1000).toFixed(1)}k</div>
                  <div style={{fontSize:13,fontWeight:600}}>${(r.com/1000).toFixed(1)}k</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==="users" && (
          <div className="fu">
            {/* Stats */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10,marginBottom:20}}>
              {[["Total",users.length,C.text],["Active",users.filter(u=>!u.blacklisted).length,C.green],["Violations",users.reduce((s,u)=>s+u.violations,0),C.amber],["Blacklisted",users.filter(u=>u.blacklisted).length,C.red]].map(([l,v,c])=>(
                <div key={l} style={{background:C.surf,border:`1px solid ${C.border}`,borderRadius:12,padding:"14px 12px"}}>
                  <div style={{fontSize:26,fontWeight:700,color:c}}>{v}</div>
                  <div style={{color:C.sub,fontSize:12,marginTop:2}}>{l}</div>
                </div>
              ))}
            </div>
            {/* Filter */}
            <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
              {[{id:"all",label:"All"},{id:"driver",label:"Drivers"},{id:"shipper",label:"Shippers"},{id:"blacklisted",label:"🚫 Blacklisted"},{id:"violations",label:"⚠ Violations"}].map(f=>(
                <button key={f.id} onClick={()=>setUserFilter(f.id)} className={`chip ${userFilter===f.id?"on":""}`} style={{padding:"6px 12px"}}>{f.label}</button>
              ))}
            </div>
            {/* User list */}
            {filtered.map(u=>(
              <div key={u.id} style={{background:C.surf,border:`1px solid ${u.blacklisted?C.red:u.violations>0?C.amber:C.border}`,borderRadius:12,marginBottom:10,overflow:"hidden",opacity:u.blacklisted?.7:1}}>
                <div style={{padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",gap:10,alignItems:"center"}}>
                    <div style={{width:38,height:38,borderRadius:"50%",background:C.surf2,display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${C.border}`,fontSize:18}}>
                      {u.role==="driver"?"🚛":"📦"}
                    </div>
                    <div>
                      <div style={{fontWeight:600,fontSize:14,display:"flex",alignItems:"center",gap:6}}>
                        {u.name}
                        {u.blacklisted && <span style={{fontSize:10,background:`${C.red}20`,color:C.red,border:`1px solid ${C.red}40`,borderRadius:4,padding:"1px 6px",fontWeight:700}}>BLACKLISTED</span>}
                        {u.violations>0 && !u.blacklisted && <span style={{fontSize:10,background:`${C.amber}20`,color:C.amber,border:`1px solid ${C.amber}40`,borderRadius:4,padding:"1px 6px",fontWeight:700}}>{u.violations} VIOLATION{u.violations>1?"S":""}</span>}
                      </div>
                      <div style={{color:C.sub,fontSize:12,marginTop:1}}>{u.email}</div>
                      {u.company && <div style={{color:C.sub,fontSize:11,marginTop:1}}>🏢 {u.company}</div>}
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <span style={{fontSize:11,padding:"2px 8px",borderRadius:8,fontWeight:600,background:u.role==="driver"?"rgba(39,110,241,.1)":"rgba(5,148,79,.1)",color:u.role==="driver"?C.blue:C.green,border:`1px solid ${u.role==="driver"?C.blue:C.green}30`}}>
                      {u.role==="driver"?(u.dType==="fleet"?"Fleet driver":"Independent"):(u.sType==="company"?"Company":"Individual")}
                    </span>
                    <div style={{color:C.sub,fontSize:11,marginTop:4}}>{u.trips} trips · ⭐{u.rating}</div>
                  </div>
                </div>
                <div style={{padding:"8px 16px",background:C.surf2,borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{color:C.sub,fontSize:12}}>{u.role==="driver"?`Plate: ${u.plate}`:"Shipper account"}</div>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>issueViolation(u)} style={{padding:"5px 12px",borderRadius:7,border:`1px solid ${C.amber}`,background:`${C.amber}10`,color:C.amber,fontSize:12,fontWeight:600,cursor:"pointer"}}>⚠ Violation</button>
                    {!u.blacklisted
                      ? <button onClick={()=>blacklist(u)} style={{padding:"5px 12px",borderRadius:7,border:`1px solid ${C.red}`,background:`${C.red}10`,color:C.red,fontSize:12,fontWeight:600,cursor:"pointer"}}>🚫 Blacklist</button>
                      : <button onClick={()=>unblock(u.id)} style={{padding:"5px 12px",borderRadius:7,border:`1px solid ${C.green}`,background:`${C.green}10`,color:C.green,fontSize:12,fontWeight:600,cursor:"pointer"}}>✓ Unblock</button>
                    }
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Violation Modal */}
      {violation && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:3000,padding:20}}>
          <div style={{width:"100%",maxWidth:440,background:C.surf,borderRadius:16,border:`1px solid ${C.border}`,overflow:"hidden"}}>
            <div style={{padding:"16px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><div style={{fontWeight:700,fontSize:16}}>⚠ Issue Violation</div><div style={{color:C.sub,fontSize:12,marginTop:2}}>{violation.name} · {violation.email}</div></div>
              <button onClick={()=>setViolation(null)} style={{background:"none",border:"none",color:C.sub,fontSize:20,cursor:"pointer"}}>✕</button>
            </div>
            <div style={{padding:18}}>
              {!vSent ? <>
                <div className="lbl" style={{marginBottom:8}}>Violation type</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
                  {["Safety violation","Cargo damage","No-show","Fraudulent activity","Policy breach","Customer complaint"].map(v=>(
                    <button key={v} onClick={()=>setVText(v)} style={{padding:"9px 10px",borderRadius:8,border:`1px solid ${vText===v?C.amber:C.border}`,background:vText===v?`${C.amber}10`:C.surf2,color:vText===v?C.amber:C.sub,fontSize:12,fontWeight:500,cursor:"pointer",textAlign:"left"}}>{v}</button>
                  ))}
                </div>
                <F label="Additional notes" value={["Safety violation","Cargo damage","No-show","Fraudulent activity","Policy breach","Customer complaint"].includes(vText)?"":vText} onChange={setVText} placeholder="Describe the violation…" rows={3}/>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <button className="btnS" onClick={()=>setViolation(null)} style={{fontSize:13}}>Cancel</button>
                  <button onClick={sendViolation} style={{padding:12,borderRadius:8,border:"none",background:C.amber,color:"#000",fontSize:13,fontWeight:700,cursor:"pointer",opacity:vText.trim()?1:.4}}>Send Violation</button>
                </div>
              </> : (
                <div style={{textAlign:"center",padding:"20px 0"}}>
                  <div style={{fontSize:40,marginBottom:12}}>⚠️</div>
                  <div style={{fontWeight:700,fontSize:16,marginBottom:4}}>Violation issued</div>
                  <div style={{color:C.sub,fontSize:13,marginBottom:20}}>{violation.name} has been notified by email.</div>
                  <button className="btnP" onClick={()=>setViolation(null)}>Close</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Blacklist Confirm */}
      {blacklistTarget && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:3000,padding:20}}>
          <div style={{width:"100%",maxWidth:400,background:C.surf,borderRadius:16,border:`1px solid ${C.red}40`,overflow:"hidden"}}>
            <div style={{padding:"16px 18px",borderBottom:`1px solid ${C.border}`}}>
              <div style={{fontWeight:700,fontSize:16}}>🚫 Blacklist User</div>
              <div style={{color:C.sub,fontSize:12,marginTop:2}}>This will permanently block the user</div>
            </div>
            <div style={{padding:18}}>
              <div style={{background:`${C.red}08`,border:`1px solid ${C.red}25`,borderRadius:10,padding:14,marginBottom:14}}>
                <div style={{fontWeight:600,fontSize:14,marginBottom:4}}>{blacklistTarget.name}</div>
                <div style={{color:C.sub,fontSize:12}}>{blacklistTarget.email}</div>
                {blacklistTarget.company && <div style={{color:C.sub,fontSize:12,marginTop:2}}>🏢 {blacklistTarget.company}</div>}
                <div style={{color:C.sub,fontSize:12,marginTop:2}}>{blacklistTarget.trips} trips · {blacklistTarget.violations} violations</div>
              </div>
              <div style={{color:C.sub,fontSize:13,marginBottom:16,lineHeight:1.5}}>Blacklisting will prevent login, cancel active jobs, and block new registrations with the same email and phone.</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <button className="btnS" onClick={()=>setBlacklistTarget(null)}>Cancel</button>
                <button onClick={confirmBlacklist} style={{padding:12,borderRadius:8,border:"none",background:C.red,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>🚫 Blacklist</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ROOT ──────────────────────────────────────────────────────
export default function App() {
  const [lang, setLang] = useState("en");
  const [user, setUser] = useState(null);
  const [pricing, setPricing] = useState({...PRICING_DEF, mul:{...PRICING_DEF.mul}});
  const [adminMode, setAdminMode] = useState(false);
  const [adminAuthed, setAdminAuthed] = useState(false);

  useEffect(()=>{
    const p = new URLSearchParams(window.location.search);
    if (p.get("admin")===ADMIN_KEY) setAdminMode(true);
  },[]);

  const LangSwitch = () => (
    <div style={{position:"fixed",bottom:20,right:20,display:"flex",gap:8,zIndex:200}}>
      {["en","es"].map(l=>(
        <button key={l} onClick={()=>setLang(l)} style={{padding:"6px 14px",borderRadius:20,cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"Inter,sans-serif",border:`1px solid ${lang===l?C.text:C.border}`,background:lang===l?C.surf2:C.surf,color:lang===l?C.text:C.sub}}>
          {l==="en"?"🇺🇸 EN":"🇪🇸 ES"}
        </button>
      ))}
    </div>
  );

  if (adminMode && !adminAuthed) return <><style>{G}</style><AdminLogin onSuccess={()=>setAdminAuthed(true)}/></>;
  if (adminMode && adminAuthed)  return <><style>{G}</style><AdminDashboard pricing={pricing} setPricing={setPricing} onExit={()=>{setAdminMode(false);setAdminAuthed(false);}}/></>;
  if (!user) return <><style>{G}</style><LangSwitch/><Auth lang={lang} onLogin={setUser}/></>;
  if (user.role==="driver") return <><style>{G}</style><LangSwitch/><DriverApp user={user} lang={lang} pricing={pricing} onLogout={()=>setUser(null)} incomingJob={null}/></>;
  return <><style>{G}</style><LangSwitch/><ShipperApp user={user} lang={lang} pricing={pricing} onLogout={()=>setUser(null)}/></>;
}
