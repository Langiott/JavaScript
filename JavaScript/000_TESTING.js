// Una async function restituisce sempre una Promise.
async function caricaDipendente(id) {
  // simulazione di una query: in produzione sarebbe await prisma...
  return { id, nome: 'Anna', badge: 'UP-001' };
}
caricaDipendente(1).then((d) => console.log(d.nome)); // => Anna  (asincrono)

// async/await con try/catch (gestione errori tipica).
async function timbra(badge) {
  try {
    if (!badge) throw new Error('badge assente');
    return `timbrato ${badge}`;
  } catch (err) {
    return `errore: ${err.message}`;
  }
}
timbra('').then(console.log); // => errore: badge assente