// Conversación completa extraída con máxima fidelidad de las capturas de pantalla de Tinder
const CHAT_DATA = [
  {
    id: 1,
    sender: "user",
    text: "Hola 👋",
    date: "mié, 13 nov 2024, 11:03 p. m."
  },
  {
    id: 2,
    sender: "mildret",
    text: "Holi",
    liked: false
  },
  {
    id: 3,
    sender: "user",
    text: "Recomiendame una canción, para conocerte un poco, puede ser la que sea ajaj"
  },
  {
    id: 4,
    sender: "mildret",
    text: "Pues me gusta mucho die first de Nessa Barrett",
    liked: false
  },
  {
    id: 5,
    sender: "user",
    text: "Ah es la que tienes en tu bio no?"
  },
  {
    id: 6,
    sender: "user",
    text: "La verdad nunca la había escuchado, la acabo de escuchar, me gustó bastante"
  },
  {
    id: 7,
    sender: "user",
    text: "La letra también muy buena"
  },
  {
    id: 8,
    sender: "mildret",
    text: "Si jsjs",
    liked: false
  },
  {
    id: 9,
    sender: "user",
    text: "Me agradaron tus vibes"
  },
  {
    id: 10,
    sender: "mildret",
    text: "Es buena, casi nadie la conoce pero está mejor así no queman la letra jsjs",
    liked: true // Marcado con corazón rojo en la captura
  },
  {
    id: 11,
    sender: "mildret",
    text: "Que vibes tengo?",
    liked: false
  },
  {
    id: 12,
    sender: "user",
    text: "Generalmente pregunto lo de la canción pq siento que es una manera muy simple de darse una idea de la vibra general de las personas"
  },
  {
    id: 13,
    sender: "user",
    text: "Me dio una vibra como emocional y tranquila pero también intensa, no sé como explicarlo bien jaja"
  },
  {
    id: 14,
    sender: "user",
    text: "No se si realmente va contigo esa descripción, pero por la canción eso fue lo que pude notar, te digo que igual no es 100% fiable eso, pero me ha servido con mis amigos"
  },
  {
    id: 15,
    sender: "mildret",
    text: "Pues si podría describirme así Jsjs",
    liked: true // Marcado con corazón rojo en la captura
  },
  {
    id: 16,
    sender: "mildret",
    text: "Yo noté que te gusta blackpink",
    liked: false
  },
  {
    id: 17,
    sender: "user",
    text: "Así es, me gusta mucho el kpop en general jaja"
  },
  {
    id: 18,
    sender: "user",
    text: "Te gusta blackpink?"
  },
  {
    id: 19,
    sender: "mildret",
    text: "Que padre",
    liked: false
  },
  {
    id: 20,
    sender: "mildret",
    text: "Si un poco sjsj",
    liked: false
  },
  {
    id: 21,
    sender: "mildret",
    text: "Es que hace tiempo me gustaban mucho pero luego como que las dejé de escuchar Jsjs",
    liked: false
  },
  {
    id: 22,
    sender: "user",
    text: "Tampoco es como que hayan sacado muchas nuevas canciones jajaj 🥹"
  },
  {
    id: 23,
    sender: "user",
    text: "Y normalmente qué escuchas? Nessa barret es tu artista favorito?"
  },
  {
    id: 24,
    sender: "user",
    text: "Favorita*"
  },
  {
    id: 25,
    sender: "mildret",
    text: "Jsjsj tienes razón",
    liked: false
  },
  {
    id: 26,
    sender: "mildret",
    text: "Mi artista fav es Olivia Rodrigo Jsjs",
    liked: true // Marcado con corazón rojo en la captura
  },
  {
    id: 27,
    sender: "mildret",
    text: "Pero últimamente nessa me gusta mucho Jsjs",
    liked: false
  },
  {
    id: 28,
    sender: "mildret",
    text: "Y quien es tu artista favorito?",
    liked: false
  },
  {
    id: 29,
    sender: "user",
    text: "Muy buena Olivia, la verdad no la escucho mucho pero las pocas canciones que he escuchado de ella me gustan bastante"
  },
  {
    id: 30,
    sender: "user",
    text: "Por cierto viste que va a venir a México?"
  },
  {
    id: 31,
    sender: "user",
    text: "Mi artista favorito era Twice, pero como que me fueron gustando cada vez menos ajaj, todavía me gustan pero ya no son mis favs"
  },
  {
    id: 32,
    sender: "user",
    text: "Después fue Loona y ya no existe 😩"
  },
  {
    id: 33,
    sender: "user",
    text: "Ahorita es un grupo que casi ni fans tiene jaja, se llama purple kiss, pero me gustan mucho sus canciones"
  },
  {
    id: 34,
    sender: "mildret",
    text: "Si a CDMX",
    liked: false
  },
  {
    id: 35,
    sender: "mildret",
    text: "No conozco, solo a twice Jsjs",
    liked: false
  },
  {
    id: 36,
    sender: "mildret",
    text: "Pero supongo que son de kpop",
    liked: false
  },
  {
    id: 37,
    sender: "user",
    text: "Ah sí, puro kpop, en general no escucho otras cosas jajaj osea me gustan otras canciones de otros artistas, pero no las escucho yo por mi cuenta"
  },
  {
    id: 38,
    sender: "user",
    text: "Vas a ir a verla a cdmx?"
  },
  {
    id: 39,
    sender: "user",
    text: "En tu bio tienes una foto en Chapultepec no?"
  },
  {
    id: 40,
    sender: "user",
    text: "O me confundí jajaj"
  },
  {
    id: 41,
    sender: "mildret",
    text: "Jsjsjs si es chapu",
    liked: false
  },
  {
    id: 42,
    sender: "mildret",
    text: "No lo sé Jsjsj",
    liked: false
  },
  {
    id: 43,
    sender: "mildret",
    text: "Es que todavía no sé el precio de los boletos y aparte creo que voy a estar en clases Jsjsj",
    liked: false
  },
  {
    id: 44,
    sender: "user",
    text: "Ah es verdad"
  },
  {
    id: 45,
    sender: "user",
    text: "Qué estudias?"
  },
  {
    id: 46,
    sender: "mildret",
    text: "Gestión y ciencias del agua",
    liked: false
  },
  {
    id: 47,
    sender: "user",
    text: "No sé pq me imaginaba que era algo de la naturaleza jaja"
  },
  {
    id: 48,
    sender: "user",
    text: "En qué semestre vas?"
  },
  {
    id: 49,
    sender: "mildret",
    text: "Jsjsjs",
    liked: false
  },
  {
    id: 50,
    sender: "mildret",
    text: "Soy de primer semestre",
    liked: false
  },
  {
    id: 51,
    sender: "user",
    text: "Ah jajaj"
  },
  {
    id: 52,
    sender: "user",
    text: "Bueno vas empezando, tabien"
  },
  {
    id: 53,
    sender: "user",
    text: "Oye te parece si hablamos por otro lado? La verdad no me gusta el chat de tinder"
  },
  {
    id: 54,
    sender: "user",
    text: "Si se puede por wp mejor 🤙🏼",
    statusBadge: "Enviado"
  },
  {
    id: 55,
    sender: "mildret",
    text: "Sip",
    liked: false
  },
  {
    id: 56,
    sender: "mildret",
    text: "5540470314",
    liked: true, // Marcado con corazón rojo en la captura
    isPhone: true
  }
];

const SUGGESTED_MESSAGE = {
  header: "🔄 Toca para ver aleatorio",
  text: "¡Holiii, Mildret!\n¿Cómo va todo?",
  buttonText: "Enviar",
  label: "Mensaje sugerido"
};

// Respuestas interactivas por si el usuario escribe después de terminar la simulación
const INTERACTIVE_REPLIES = [
  "Jajaja ya te tengo en Whats! Háblame por allá 🙈",
  "Sii, te paso mensaje al rato que salga de clases jsjs",
  "Oye y qué canción de Nessa te gustó más?",
  "Ahorita ando con unos pendientes de la facu pero te contesto por Whats!",
  "Jsjsjs qué padre, me agradaste bastante!"
];
