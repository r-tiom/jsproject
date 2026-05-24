import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Edit3, Trash2, Save, X, Sparkles, Upload, FileAudio, Music, Check, Image as ImageIcon } from 'lucide-react';
import { Beat } from '../types';
import { ResolvedImage } from './ResolvedImage';

export const AdminPanel: React.FC = () => {
  const { beats, addBeat, updateBeat, deleteBeat } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('Trap');
  const [bpm, setBpm] = useState(130);
  const [key, setKey] = useState('A Minor');
  const [coverUrl, setCoverUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [priceMp3, setPriceMp3] = useState(29);
  const [priceWav, setPriceWav] = useState(49);
  const [priceTrackout, setPriceTrackout] = useState(99);
  const [priceExclusive, setPriceExclusive] = useState(499);
  const [isFeatured, setIsFeatured] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

  // Physical files states
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Drag and drop state
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');

  const genresList = ['Trap', 'Drill', 'Hip Hop', 'R&B / Trap-Soul', 'Synthwave', 'Pop', 'Lo-Fi', 'Grime'];
  const keysList = [
    'A Major', 'A Minor', 'A# Major', 'A# Minor', 'B Major', 'B Minor',
    'C Major', 'C Minor', 'C# Major', 'C# Minor', 'D Major', 'D Minor',
    'D# Major', 'D# Minor', 'E Major', 'E Minor', 'F Major', 'F Minor',
    'F# Major', 'F# Minor', 'G Major', 'G Minor', 'G# Major', 'G# Minor'
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = () => {
    setIsDraggingFile(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      setUploadedFileName(file.name);
      setAudioFile(file);
      
      // Auto-populate Title based on file name (e.g., "cool_trap_beat.wav" -> "Cool Trap Beat")
      const cleanName = file.name
        .replace(/\.[^/.]+$/, "") // strip extension
        .replace(/[_\-]/g, " ") // replace dashes
        .replace(/\b\w/g, c => c.toUpperCase()); // capitalize wording
      
      if (!title) setTitle(cleanName);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setUploadedFileName(file.name);
      setAudioFile(file);
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[_\-]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
      if (!title) setTitle(cleanName);
    }
  };

  const resetForm = () => {
    setTitle('');
    setGenre('Trap');
    setBpm(130);
    setKey('A Minor');
    setCoverUrl('');
    setAudioUrl('');
    setTagsInput('');
    setPriceMp3(29);
    setPriceWav(49);
    setPriceTrackout(99);
    setPriceExclusive(499);
    setIsFeatured(false);
    setUploadedFileName('');
    setVideoUrl('');
    setAudioFile(null);
    setCoverFile(null);
  };

  const handleCreateBeat = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title) return;
    setIsSaving(true);

    try {
      const beatId = 'beat_' + Date.now().toString();
      let finalAudio = audioUrl.trim();
      let finalCover = coverUrl.trim();

      if (audioFile) {
        const { saveFileToDB } = await import('../utils/db');
        finalAudio = await saveFileToDB(`audio_${beatId}`, audioFile);
      }

      if (coverFile) {
        const { saveFileToDB } = await import('../utils/db');
        finalCover = await saveFileToDB(`cover_${beatId}`, coverFile);
      }

      // Use default reliable covers if left blank
      const finalCoverImg = finalCover || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80';
      const finalAudioTrack = finalAudio || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3';

      const tags = tagsInput
        ? tagsInput.split(',').map(t => t.trim()).filter(t => t.length > 0)
        : ['Exclusive', 'Producer', 'R-Tiom'];

      addBeat({
        id: beatId,
        title,
        genre,
        bpm: Number(bpm),
        key,
        coverUrl: finalCoverImg,
        audioUrl: finalAudioTrack,
        tags,
        prices: {
          mp3: Number(priceMp3),
          wav: Number(priceWav),
          trackout: Number(priceTrackout),
          exclusive: Number(priceExclusive),
        },
        isFeatured,
        videoUrl: videoUrl.trim() || undefined
      });

      setIsAdding(false);
      resetForm();
    } catch (err) {
      console.error('Error uploading beat files:', err);
      alert('Ошибка при сохранении файлов. Пожалуйста, попробуйте еще раз.');
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (beat: Beat) => {
    setEditingId(beat.id);
    setTitle(beat.title);
    setGenre(beat.genre);
    setBpm(beat.bpm);
    setKey(beat.key);
    setCoverUrl(beat.coverUrl);
    setAudioUrl(beat.audioUrl);
    setTagsInput(beat.tags.join(', '));
    setPriceMp3(beat.prices.mp3);
    setPriceWav(beat.prices.wav);
    setPriceTrackout(beat.prices.trackout);
    setPriceExclusive(beat.prices.exclusive);
    setIsFeatured(beat.isFeatured || false);
    setVideoUrl(beat.videoUrl || '');
    setAudioFile(null);
    setCoverFile(null);
  };

  const handleUpdateBeat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setIsSaving(true);

    try {
      let finalAudio = audioUrl.trim();
      let finalCover = coverUrl.trim();

      if (audioFile) {
        const { saveFileToDB } = await import('../utils/db');
        finalAudio = await saveFileToDB(`audio_${editingId}`, audioFile);
      }

      if (coverFile) {
        const { saveFileToDB } = await import('../utils/db');
        finalCover = await saveFileToDB(`cover_${editingId}`, coverFile);
      }

      const tags = tagsInput
        ? tagsInput.split(',').map(t => t.trim()).filter(t => t.length > 0)
        : ['Producer', 'Beats'];

      updateBeat(editingId, {
        title,
        genre,
        bpm: Number(bpm),
        key,
        coverUrl: finalCover || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80',
        audioUrl: finalAudio || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        tags,
        prices: {
          mp3: Number(priceMp3),
          wav: Number(priceWav),
          trackout: Number(priceTrackout),
          exclusive: Number(priceExclusive),
        },
        isFeatured,
        videoUrl: videoUrl.trim() || undefined
      });

      setEditingId(null);
      resetForm();
    } catch (err) {
      console.error('Error updating beat files:', err);
      alert('Ошибка при сохранении измененных файлов.');
    } finally {
      setIsSaving(false);
    }
  };

  const cancelAction = () => {
    setIsAdding(false);
    setEditingId(null);
    resetForm();
  };

  return (
    <div className="bg-zinc-950 rounded-2xl border border-zinc-900 overflow-hidden text-white hover:shadow-2xl transition duration-300">
      <div className="p-6 border-b border-zinc-900 bg-zinc-900/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display font-black text-xl tracking-wider text-white flex items-center gap-2">
            <Sparkles className="text-amber-500 animate-pulse" size={18} />
            ПАНЕЛЬ УПРАВЛЕНИЯ КАТАЛОГОМ
          </h2>
          <p className="text-xs text-zinc-500 mt-1">Добавляйте, редактируйте цены и распространяйте новые биты r-tiom production</p>
        </div>

        {!isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-amber-500/10"
          >
            <Plus size={15} /> ДОБАВИТЬ НОВЫЙ БИТ
          </button>
        )}
      </div>

      <div className="p-6">
        {/* --- FORM STATE: CREATING OR EDITING --- */}
        {(isAdding || editingId) && (
          <form onSubmit={isAdding ? handleCreateBeat : handleUpdateBeat} className="space-y-6 max-w-3xl border border-zinc-900 bg-zinc-900/10 rounded-2xl p-6">
            <div className="flex justify-between items-center pb-4 border-b border-zinc-900">
              <h3 className="font-display font-black text-amber-500 text-sm uppercase tracking-widest">
                {isAdding ? 'НОВЫЙ ТРЕКВЕЙВ БИТ' : `РЕДАКТИРОВАНИЕ ТРЕКА: ID-${editingId}`}
              </h3>
              <button
                type="button"
                onClick={cancelAction}
                className="text-zinc-500 hover:text-white text-xs flex items-center gap-1 hover:underline cursor-pointer"
              >
                <X size={14} /> Отменить
              </button>
            </div>

            {/* Drag & Drop Audio Upload Zone */}
            {isAdding && (
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Загрузка Аудиофайла (Demo Dropzone)
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition ${
                    isDraggingFile
                      ? 'border-amber-500 bg-amber-500/5'
                      : uploadedFileName
                      ? 'border-emerald-500/50 bg-emerald-500/5'
                      : 'border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/25'
                  }`}
                >
                  <input
                    type="file"
                    id="audio-uploader"
                    accept=".mp3,.wav"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="audio-uploader" className="cursor-pointer flex flex-col items-center">
                    {uploadedFileName ? (
                      <>
                        <div className="p-3 bg-emerald-500/15 text-emerald-400 rounded-full mb-3">
                          <Check size={28} />
                        </div>
                        <span className="block text-xs font-bold text-zinc-100">{uploadedFileName}</span>
                        <span className="block text-[10px] text-zinc-500 mt-1">
                          Файл распознан. Плеер и обложка автоматически сгенерированы!
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="p-3 bg-zinc-900 text-amber-500 rounded-full mb-3 border border-zinc-800">
                          <Upload size={24} />
                        </div>
                        <span className="block text-xs font-bold text-zinc-300">
                          Перетащите MP3/WAV или кликните для выбора
                        </span>
                        <span className="block text-[10px] text-zinc-500 mt-1.5 font-mono">
                          МАКС 150MB • ТЕГИ БУДУТ СТРИПНУТЫ АВТОМАТИЧЕСКИ
                        </span>
                      </>
                    )}
                  </label>
                </div>
              </div>
            )}

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Название бита *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Nightcore Chase"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-amber-500 focus:outline-none text-sm transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Жанр *
                  </label>
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-amber-500 focus:outline-none text-sm text-zinc-300 transition"
                  >
                    {genresList.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Тональность *
                  </label>
                  <select
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-amber-500 focus:outline-none text-sm text-zinc-300 transition scrollbar"
                  >
                    {keysList.map(k => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Tempo (BPM) *
                  </label>
                  <input
                    type="number"
                    required
                    min={40}
                    max={250}
                    value={bpm}
                    onChange={(e) => setBpm(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-amber-500 focus:outline-none text-sm transition"
                  />
                </div>
                <div className="flex items-center gap-2 h-full pt-6">
                  <input
                    type="checkbox"
                    id="is-featured-checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500/20 bg-zinc-950 border-zinc-850"
                  />
                  <label htmlFor="is-featured-checkbox" className="text-xs font-semibold text-zinc-300 select-none">
                    Поместить в топ (Рекомендованный)
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Теги бита (через запятую)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="808, Hard, Dark, Guitar"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-amber-500 focus:outline-none text-sm transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 font-mono">
                  Аудиодемо (MP3)
                </label>
                <div className="flex gap-2.5">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                      <FileAudio size={14} />
                    </span>
                    <input
                      type="text"
                      readOnly
                      value={audioFile ? audioFile.name : audioUrl}
                      placeholder="Загрузите файл или укажите URL"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:outline-none text-sm text-zinc-300 transition"
                    />
                  </div>
                  <input
                    type="file"
                    id="audio-file-input"
                    accept=".mp3,.wav"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setAudioFile(file);
                        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[_\-]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
                        if (!title) setTitle(cleanName);
                      }
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="audio-file-input"
                    className="px-4 py-2.5 bg-zinc-90 w-auto text-center border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 duration-200 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer text-zinc-300 hover:text-white transition"
                  >
                    <Upload size={14} /> Загрузить
                  </label>
                </div>
                <input
                  type="url"
                  value={audioUrl}
                  onChange={(e) => {
                    setAudioUrl(e.target.value);
                    setAudioFile(null);
                  }}
                  placeholder="Или вставьте интернет-ссылку на аудиопоток..."
                  className="w-full px-4 py-2 mt-2 rounded-xl bg-zinc-950/40 border border-zinc-900 text-xs text-zinc-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 font-mono">
                  Обложка (Artwork JPEG/PNG)
                </label>
                <div className="flex gap-2.5">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                      <ImageIcon size={14} />
                    </span>
                    <input
                      type="text"
                      readOnly
                      value={coverFile ? coverFile.name : coverUrl}
                      placeholder="Загрузите изображение или укажите URL"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:outline-none text-sm text-zinc-300 transition"
                    />
                  </div>
                  <input
                    type="file"
                    id="cover-file-input"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setCoverFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="cover-file-input"
                    className="px-4 py-2.5 bg-zinc-90 w-auto text-center border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 duration-200 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer text-zinc-300 hover:text-white transition"
                  >
                    <Upload size={14} /> Загрузить
                  </label>
                </div>
                <input
                  type="url"
                  value={coverUrl}
                  onChange={(e) => {
                    setCoverUrl(e.target.value);
                    setCoverFile(null);
                  }}
                  placeholder="Или вставьте интернет-ссылку на обложку..."
                  className="w-full px-4 py-2 mt-2 rounded-xl bg-zinc-950/40 border border-zinc-900 text-xs text-zinc-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Ссылка на Video Player (YouTube Embed / MP4)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400 font-mono text-[10px]">
                    VIDEO
                  </span>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="e.g. https://www.youtube.com/embed/S_7iX6O_69o"
                    className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-amber-500 focus:outline-none text-sm transition"
                  />
                </div>
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  Будет использован YouTube-плеер на отдельной странице бита.
                </span>
              </div>
            </div>

            {/* Pricing Panel Setup */}
            <div className="pt-2">
              <span className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 border-b border-zinc-900 pb-1.5">
                НАСТРОЙКА ЦЕНОВОЙ СЕТКИ (USD $)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">MP3 $</label>
                  <input
                    type="number"
                    required
                    value={priceMp3}
                    onChange={(e) => setPriceMp3(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">WAV $</label>
                  <input
                    type="number"
                    required
                    value={priceWav}
                    onChange={(e) => setPriceWav(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Trackout $</label>
                  <input
                    type="number"
                    required
                    value={priceTrackout}
                    onChange={(e) => setPriceTrackout(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Exclusive $</label>
                  <input
                    type="number"
                    required
                    value={priceExclusive}
                    onChange={(e) => setPriceExclusive(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-sm focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-zinc-900 flex justify-end gap-3.5">
              <button
                type="button"
                onClick={cancelAction}
                className="px-5 py-2.5 rounded-xl border border-zinc-800 text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-white hover:border-zinc-700 transition cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-amber-500/10"
              >
                <Save size={14} /> {isAdding ? 'СОХРАНИТЬ В КАТАЛОГ' : 'ОБНОВИТЬ ИЗМЕНЕНИЯ'}
              </button>
            </div>
          </form>
        )}

        {/* --- STATE: DISPLAYING CATALOG TABLE FOR MANAGEMENT --- */}
        {!isAdding && !editingId && (
          <div className="overflow-x-auto rounded-xl border border-zinc-900">
            <table className="w-full border-collapse text-left text-sm text-zinc-400">
              <thead className="bg-zinc-900/40 text-xs font-bold uppercase text-zinc-500 border-b border-zinc-900">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Бит / Инструментал</th>
                  <th scope="col" className="px-6 py-3.5">Жанр</th>
                  <th scope="col" className="px-6 py-3.5">Спецификация</th>
                  <th scope="col" className="px-3 py-3.5">Прослушивания</th>
                  <th scope="col" className="px-6 py-3.5">Цены (MP3/WAV/Exclusive)</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Управление</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 bg-black/20">
                {beats.map((beat) => (
                  <tr key={beat.id} className="hover:bg-zinc-900/30 transition">
                    <td className="whitespace-nowrap px-6 py-4 flex items-center gap-3">
                      <ResolvedImage
                        src={beat.coverUrl}
                        alt=""
                        className="h-10 w-10 rounded-lg object-cover border border-zinc-800"
                      />
                      <div className="overflow-hidden">
                        <div className="font-display font-medium text-white text-sm uppercase truncate max-w-[150px]">
                          {beat.title}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono mt-0.5 uppercase tracking-wider">
                          ID: {beat.id}
                        </div>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="text-xs bg-zinc-905 border border-zinc-850 px-2 py-0.5 rounded text-amber-500 uppercase font-medium">
                        {beat.genre}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-zinc-300">
                      <div>{beat.bpm} BPM</div>
                      <div className="text-[10px] text-zinc-500">{beat.key}</div>
                    </td>

                    <td className="whitespace-nowrap px-3 py-4 font-mono text-xs text-zinc-300">
                      {beat.plays}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-zinc-300">
                      <div className="flex gap-2">
                        <span className="text-zinc-500">MP3:</span> 
                        <strong className="text-zinc-200">${beat.prices.mp3}</strong>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-zinc-500">WAV:</span> 
                        <strong className="text-zinc-200">${beat.prices.wav}</strong>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-zinc-500">EXCL:</span> 
                        {beat.isSoldExclusive ? (
                          <span className="text-red-500 font-bold uppercase text-[9px] bg-red-950/20 border border-red-900/25 px-1 rounded">SOLD</span>
                        ) : (
                          <strong className="text-yellow-400">${beat.prices.exclusive}</strong>
                        )}
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => startEdit(beat)}
                          className="p-2 rounded-lg bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                          title="Редактировать цену или метаданные"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Вы уверены, что хотите удалить бит "${beat.title}"?`)) {
                              deleteBeat(beat.id);
                              import('../utils/db').then(({ deleteFileFromDB }) => {
                                deleteFileFromDB('audio_' + beat.id);
                                deleteFileFromDB('cover_' + beat.id);
                              }).catch(err => console.error("Could not delete from DB:", err));
                            }
                          }}
                          className="p-2 rounded-lg bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-red-400 hover:bg-zinc-850 transition cursor-pointer"
                          title="Удалить бит из каталога"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {beats.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                      Каталог пуст. Нажмите "Добавить новый бит", чтобы залить вашу первую аудиоработу!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
