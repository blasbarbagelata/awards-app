const BASE_URL = "https://casasauiawards.up.railway.app";
const ADMIN_PASSWORD = "admin123";

const categorias = [
  { nombre: "👴 El Abuelo", descripcion: "No llega despierto a las 12 de la noche. Para llevarlo al boliche necesitas una grua.", orden: 1 },
  { nombre: "📵 El Caruso Lombardi", descripcion: "Dice que va y no aparece. Excusas y desapariciones.", orden: 2 },
  { nombre: "✈️ El Pingaseca", descripcion: "Es capaz de viajar 5000km, matar con sus propias manos a un amigo o invertir millones de dólares si se lo pide una minita.", orden: 3 },
  { nombre: "🐶 El Bichero", descripcion: "No es necesario explicación.", orden: 4 },
  { nombre: "🍭 El Candyman", descripcion: "Robacunas. Le excitan las que no cumplen la regla de [edad / 2 + 7].", orden: 5 },
  { nombre: "🪚 El Serruchador", descripcion: "Hace todo lo posible por liquidar a sus amigos.", orden: 6 },
  { nombre: "🌈 El más puto", descripcion: "Simplemente el más homosexual.", orden: 7 },
  { nombre: "🍻 El más copeti", descripcion: "Noches alegres, mañanas tristes. Muchos excesos que llevaron a cometer atrocidades.", orden: 8 },
  { nombre: "🧠 El más gaga", descripcion: "No sabe ni donde está parado. Tira comentarios gaga. Se traba. No redondea. Lisa y llanamente gaga.", orden: 9 },
  { nombre: "🟤 El más marronazo", descripcion: "Simplemente el más megro.", orden: 10 },
  { nombre: "👰 El más pollera", descripcion: "Completamente gobernado por una mujer. Falta a planes solo para quedarse cuchareando con su señora.", orden: 11 },
  { nombre: "🍔 El Orne", descripcion: "Su debilidad: gorditas.", orden: 12 },
  { nombre: "🍼 El chupete en el culo", descripcion: "Comentarios y gestos siempre hechos en el peor momento posible.", orden: 13 },
  { nombre: "🤦 El de peores opiniones", descripcion: "Mujeres, películas, comida, música. Todo siempre tiene una opinión equivocada.", orden: 14 },
  { nombre: "📢 El más exagerado", descripcion: "Nunca hay punto medio. Opinión o anécdota siempre llevada a un extremo completamente incomprendido.", orden: 15 },
  { nombre: "🎣 El Pescador", descripcion: "Busca busca busca. Juega el límite. No concreta, pero tira y tira.", orden: 16 },
  { nombre: "🥐 El Panadero", descripcion: "No para de cocinar facturas (comentarios completamente cancelables).", orden: 17 },
  { nombre: "✊ El más zurdo", descripcion: "Marx, Che Guevara, Perón, CFK libre, estado presente, aborto legal.", orden: 18 },
  { nombre: "🐀 El maestro Splinter", descripcion: "No te suelta ni un peso el hdp.", orden: 19 },
  { nombre: "😈 El más hijo de puta", descripcion: "El más hijo de mil puta.", orden: 20 },
  { nombre: "😴 El Sleepman", descripcion: "Duerme, pero no en la cama. Se le tira una mina y no se da cuenta. Tiene una regalada y no acepta el regalo.", orden: 21 },
  { nombre: "🧨 El Hitler", descripcion: "Fiel al fhürer. Racismo, antisemitismo, misoginia, xenofobia. Un poco de cada una.", orden: 22 },
];

// 1. Login para obtener la cookie
const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ password: ADMIN_PASSWORD }),
});

const cookie = loginRes.headers.get("set-cookie");
if (!cookie) {
  console.log("❌ Login fallido — verificá la contraseña");
  process.exit(1);
}
console.log("✅ Login exitoso\n");

// 2. Crear cada categoría
async function crearCategoria(cat) {
  const res = await fetch(`${BASE_URL}/api/admin/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": cookie,
    },
    body: JSON.stringify({
      name: cat.nombre,
      description: cat.descripcion,
      type: "normal",
      order: cat.orden,
    }),
  });

  if (res.ok) {
    console.log(`✅ ${cat.nombre}`);
  } else {
    const err = await res.text();
    console.log(`❌ ${cat.nombre} — ${res.status}: ${err}`);
  }
}

for (const cat of categorias) {
  await crearCategoria(cat);
}

console.log("\n¡Listo!");