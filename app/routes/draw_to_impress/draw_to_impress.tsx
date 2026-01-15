import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { socket } from '~/utils/socket';

export default function DrawToImpressForm() {

  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [studentId, setStudentId] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file || !studentId) return alert("Please fill all fields");

    setIsUploading(true);
    const formData = new FormData();
    formData.append('uploaded_image', file);
    formData.append('student_id', studentId);

    try {
      const res = await fetch('http://localhost:3000/submit', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (res.status === 403) {
         alert("Cannot Join: The game has already started.");
         setIsUploading(false);
         return;
      }

      if (data.success) {
        // Save token and connect
        localStorage.setItem('game_token', data.token);
        socket.auth = { token: data.token };
        socket.connect();
        
        // Optimistic redirect (Layout will correct if state is wrong)
        navigate('/draw_to_impress/lobby'); 
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Network Error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleUpload} className="p-4">
      <h1 className="text-2xl font-bold mb-4">Join Draw to Impress</h1>
      <div className="flex flex-col gap-4 max-w-sm">
        <input 
            type="text" 
            placeholder="Student ID" 
            className="border p-2 rounded"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)} 
        />
        <input 
            type="file" 
            className="border p-2 rounded"
            onChange={(e) => {
                if(e.target.files) setFile(e.target.files[0]);
            }} 
        />
        <button 
            disabled={isUploading}
            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
            {isUploading ? "Joining..." : "Join Game"}
        </button>
      </div>
    </form>
  );
}