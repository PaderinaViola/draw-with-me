import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API = 'http://127.0.0.1:8000/api/myapp/';

export default function App() {


  const canvasRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);

  const [color, setColor] = useState('#000000');
  const [size, setSize] = useState(4);

  const [eraser, setEraser] = useState(false);

  const [strokes, setStrokes] = useState([]);
  const [thisStroke, setThisStroke] = useState([]);

  const [gallery, setGallery] = useState([]);
  const [drawingName, setDrawingName] = useState('');

  const lastPos = useRef(null);

  useEffect(() => {
    axios.get(API).then(res => setGallery(res.data));
  }, []);

 
  function getPos(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }


  function startDraw(e) {
    setIsDrawing(true);
    lastPos.current = getPos(e);
    setThisStroke([{ ...getPos(e), color, size, eraser }]);
  }


  function draw(e) {
    if (!isDrawing) return;
    const ctx = canvasRef.current.getContext('2d');
    const pos = getPos(e);

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = eraser ? '#ffffff' : color;
    ctx.lineWidth = eraser ? size * 3 : size;
    ctx.lineCap = 'round';
    ctx.stroke();

    lastPos.current = pos;
    setThisStroke(prev => [...prev, { ...pos, color, size, eraser }]);
  }


  function endDraw() {
    if (!isDrawing) return;
    setIsDrawing(false);
    setStrokes(prev => [...prev, thisStroke]);
    setThisStroke([]);
  }


  function clearCanvas() {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, 750, 450);
    setStrokes([]);
  }

 
  async function saveDrawing() {
    if (!drawingName) { alert('Give it a name first!'); return; }
    await axios.post(API, { title: drawingName, data: strokes });
    const res = await axios.get(API);
    setGallery(res.data);
    setDrawingName('');
  }

  async function loadDrawing(id) {
    const res = await axios.get(`${API}${id}/`);
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, 750, 450);

    res.data.data.forEach(stroke => {
      stroke.forEach((pt, i) => {
        if (i === 0) return;
        ctx.beginPath();
        ctx.moveTo(stroke[i-1].x, stroke[i-1].y);
        ctx.lineTo(pt.x, pt.y);
        ctx.strokeStyle = pt.eraser ? '#ffffff' : pt.color;
        ctx.lineWidth = pt.eraser ? pt.size * 3 : pt.size;
        ctx.lineCap = 'round';
        ctx.stroke();
      });
    });
    setStrokes(res.data.data);
  }

  return (
    <div className="app">
      <h2>Drawing App</h2>

      <div className="toolbar">
        <button onClick={() => setEraser(false)}>Pencil</button>
        <button onClick={() => setEraser(true)}>Eraser</button>
        <input type="color" value={color} onChange={e => setColor(e.target.value)} />
        <label>Size: <input type="range" min="1" max="20" value={size} onChange={e => setSize(+e.target.value)} /></label>
        <button onClick={clearCanvas}>Clear</button>
      </div>

      <canvas
        ref={canvasRef}
        width={750}
        height={450}
        style={{ border: '2px solid #333', background: 'white', cursor: 'crosshair' }}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
      />

      <div className="save-row">
        <input placeholder="Drawing name..." value={drawingName} onChange={e => setDrawingName(e.target.value)} />
        <button onClick={saveDrawing}>Save</button>
      </div>

      <h3>Saved drawings</h3>
      <ul>
        {gallery.map(d => (
          <li key={d.id} onClick={() => loadDrawing(d.id)} style={{ cursor: 'pointer' }}>
            {d.title}
          </li>
        ))}
      </ul>
    </div>
  );
}