import './Notebook.css';
import React, {useRef, useEffect, useState} from 'react';

export interface INote {
  id: string;
  text: string;
}

export const Notebook = () => {
  const [noteList, setNoteList] = useState<Array<INote>>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const inputText = useRef<HTMLTextAreaElement>(null);

  async function addNote(text: string) {
    const response = await fetch('http://localhost:7070/notes', { method: 'POST', body: JSON.stringify({text})});
    if (response.status !== 204) return new Error(`HTTP code ${response.status}, ${response.statusText}`);
  }
  
  async function getAllNotes() : Promise<Array<INote> | Error>{
    const response = await fetch('http://localhost:7070/notes');
    if (response.status !== 200) return new Error(`HTTP code ${response.status}, ${response.statusText}`);
    const list: Array<INote> = await response.json();
    return list;
  }

  async function removeNote(id: string) {
    const response = await fetch(`http://localhost:7070/notes/${id}`, { method: 'DELETE' });
    if (response.status !== 204) return new Error(`HTTP code ${response.status}, ${response.statusText}`);
    await loadNoteList();
  }

  function loadNoteList() {
    if (loading) return;
    setLoading(true);
    getAllNotes().then((result) => {
      if (result instanceof Error) {
        alert(`Не удалось получить список заметок (${result.message})`);
      } else {
        setNoteList(result);
      }
      setLoading(false);
    });    
  }

  useEffect(() => {
    
    loadNoteList()
  }, []);

  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!inputText.current?.value) return;
    const error = await addNote(inputText.current?.value);
    if (error) {
      alert(`Не удалось создать заметку (${error})`);
    } else {
      await loadNoteList();
    }
  }

  async function handleRefreshButtonClick() {
    
  }

  return (
    <div className='notebook'>
      <div className='notebook-header'>
        <h2 className='notebook-title'>Список заметок</h2>
        <button onClick={handleRefreshButtonClick} className='notebook-list-refresh_button'>Обновить</button>
      </div>      
      { loading ? 'Загрузка...' : '' }
      <div className='note-list'>
        {
          loading ? '' : noteList.map(({id, text}) => (
            <div key={id} className='note'>
              <button onClick={() => removeNote(id)} className='note-remove_button'>✖</button>
              <p className='note-text'>{text}</p>
            </div>
          ))
        }
      </div>
      <form className='notebook-form' onSubmit={handleFormSubmit} >
        <label htmlFor='text'>Новая заметка</label>
        <textarea ref={inputText} name='text' className='notebook-form-text_input'></textarea>
        <button className='notebook-form-submit'>Добавить</button>
      </form>      
    </div>
  )
}
