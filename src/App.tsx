import { useEffect, useState } from 'react';
import './App.css';

interface ICharacter {
  id: number;
  name: string;
  image: string;
  status: 'unknown' | 'Alive' | 'Dead';
  species: string;
}

function App() {
  //* Se crea un useState para los personajes
  const [characters, setCharacters] = useState<ICharacter[]>([]);

  //* Se crea un array de objetos eliminados que sirve como historial
  const [deletedCharacter, setDeletedCharacter] = useState<
    { id: number; index: number }[]
  >([]);

  // * Fetch a la API y carga los personajes en el characters
  useEffect(() => {
    const fetchCharacters = async () => {
      const res = await fetch('https://rickandmortyapi.com/api/character');

      if (!res.ok) throw new Error('Error at fetching');

      const resJSON = await res.json();

      //* Al obtener los resultados vamos a limitarlos a 4
      const results = resJSON.results
        // .slice(0, 4) //! Si se quiere más de 4 personajes comentar esta linea
        .map((character: ICharacter) => ({
          ...character,
        }));

      setCharacters(results);
    };

    fetchCharacters();
  }, []);

  /*
   * FUNCION: Elimina un personaje y lo coloca en un array de historial
   */
  const onDeleteCharacter = (id: number, index: number) => {
    setDeletedCharacter((prevDeletedCharacters) => [
      ...prevDeletedCharacters,
      {
        id,
        index,
      },
    ]);
    setCharacters((prevCharacters) =>
      prevCharacters.filter((character) => character.id !== id)
    );
  };

  /*
   * FUNCION: Deshace Eliminacion de un personaje
   */
  const onUndoCharacter = async () => {
    //* Se obtiene el objeto más reciente mediante un pop
    const recentDeletedCharacterId = deletedCharacter.pop();

    //* Si no se obtiene nada debido a que el array esta vacia entonces no se ejecuta nada
    if (!recentDeletedCharacterId) return;

    //* Volvemos a hacer un fetch de los personajes mediante el ID del objeto más reciente obtenido
    const res = await fetch(
      `https://rickandmortyapi.com/api/character/${recentDeletedCharacterId.id}`
    );

    if (!res.ok) throw new Error('Error at fetching');

    //* Utilizamos un type assert para obtener el ICharacter
    const resJSON: ICharacter = await res.json();

    //* Lo insertamos en el index donde se encontraba
    setCharacters((prevCharacters) => [
      ...prevCharacters.slice(0, recentDeletedCharacterId.index),
      resJSON,
      ...prevCharacters.slice(recentDeletedCharacterId.index),
    ]);
  };

  return (
    <main>
      <div className='title'>
        <h1>Rick and Morty API</h1>
        <button onClick={onUndoCharacter}>
          Undo{' '}
          {deletedCharacter.length > 0 ? (
            <span>({deletedCharacter.length} remaining)</span>
          ) : (
            <span>(No remaining)</span>
          )}
        </button>
      </div>

      {/* Lista de personaje */}
      <ul>
        {characters.map((item, index) => (
          // Cuadro por personaje
          <li key={item.id}>
            {/* Primer bloque */}
            <img src={item.image} alt={item.name} />

            {/* Segundo bloque */}
            <div className='info-container'>
              <h2>{item.name}</h2>
              <div className='status'>
                <div className={`circle ${item.status.toLowerCase()}`}></div>
                <p>
                  {item.status} - {item.species}
                </p>
              </div>

              <button onClick={() => onDeleteCharacter(item.id, index)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}

export default App;
