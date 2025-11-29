/*
Single-file React component for a mini website for the Sangh:
Name: "हिंदी एकता शांग"
Features:
 - Edit sangh name & description
 - Add members (name, position, work) + upload photo (client-side preview)
 - Members list with photos
 - Submit security ideas (title, description, optional image)
 - Ideas list with status (Open / Action taken)
 - Data persisted in localStorage

How to use:
1) Create a React project (Vite or Create React App). Example with Vite:
   npm create vite@latest my-sangh --template react
   cd my-sangh
   npm install
2) Add Tailwind CSS (optional but the component uses Tailwind classes). If you don't want Tailwind,
   either remove classes or add your own CSS.
   (Tailwind setup instructions are available in Tailwind docs.)
3) Replace src/App.jsx with this file's content. Ensure React and ReactDOM are set up.
4) Run: npm run dev  (vite) or npm start (CRA)

NOTE: This is client-only. Photos and data are stored in browser localStorage. For production and multi-user support,
connect to a backend and cloud storage.
*/

import React, { useEffect, useState } from "react";

const LS_KEY = "hindi_ekta_shangh_data_v1";

function useLocalStorageState(key, initial) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch (e) {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {}
  }, [key, state]);
  return [state, setState];
}

export default function App() {
  const [data, setData] = useLocalStorageState(LS_KEY, {
    sanghName: "हिंदी एकता शांग",
    description: "हमारी शांग का उद्देश्य स्थानीय सुरक्षा और सामुदायिक सहयोग बढ़ाना है।",
    members: [],
    ideas: [],
  });

  // form state for adding members
  const [memberForm, setMemberForm] = useState({ name: "", position: "", work: "", photoDataUrl: "" });
  const [ideaForm, setIdeaForm] = useState({ title: "", description: "", imageDataUrl: "" });

  // helpers
  function handlePhotoUpload(file, setter) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setter((prev) => ({ ...prev, photoDataUrl: e.target.result }));
    reader.readAsDataURL(file);
  }

  function handleIdeaImageUpload(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setIdeaForm((p) => ({ ...p, imageDataUrl: e.target.result }));
    reader.readAsDataURL(file);
  }

  function addMember(e) {
    e.preventDefault();
    if (!memberForm.name.trim()) return alert("कृपया नाम डालें");
    const newMember = {
      id: Date.now(),
      name: memberForm.name,
      position: memberForm.position,
      work: memberForm.work,
      photo: memberForm.photoDataUrl || null,
    };
    setData((d) => ({ ...d, members: [...d.members, newMember] }));
    setMemberForm({ name: "", position: "", work: "", photoDataUrl: "" });
  }

  function submitIdea(e) {
    e.preventDefault();
    if (!ideaForm.title.trim()) return alert("कृपया विचार का शीर्षक डालें");
    const newIdea = {
      id: Date.now(),
      title: ideaForm.title,
      description: ideaForm.description,
      image: ideaForm.imageDataUrl || null,
      status: "Open",
      submittedAt: new Date().toISOString(),
    };
    setData((d) => ({ ...d, ideas: [newIdea, ...d.ideas] }));
    setIdeaForm({ title: "", description: "", imageDataUrl: "" });
  }

  function takeActionOnIdea(id) {
    // mark as Action Taken
    setData((d) => ({ ...d, ideas: d.ideas.map((i) => (i.id === id ? { ...i, status: "Action Taken" } : i)) }));
  }

  function removeMember(id) {
    if (!confirm("क्या आप सुनिश्चित हैं कि सदस्य हटाना चाहते हैं?")) return;
    setData((d) => ({ ...d, members: d.members.filter((m) => m.id !== id) }));
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "shang_data.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-lg p-6">
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <input
                value={data.sanghName}
                onChange={(e) => setData((d) => ({ ...d, sanghName: e.target.value }))}
                className="text-2xl font-bold border-b pb-1 outline-none"
                />
              <div>
                <textarea
                  value={data.description}
                  onChange={(e) => setData((d) => ({ ...d, description: e.target.value }))}
                  className="w-full mt-2 text-sm p-2 border rounded"
                  rows={2}
                />
              </div>
            </div>
            <div className="space-y-2 text-right">
              <button onClick={exportData} className="px-3 py-1 border rounded">Export Data</button>
              <div className="text-xs text-gray-500">डेटा ब्राउज़र में सुरक्षित रखा जाता है।</div>
            </div>
          </div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Members panel */}
          <section className="p-4 border rounded">
            <h2 className="font-semibold mb-3">सदस्य जोड़ें</h2>
            <form onSubmit={addMember} className="space-y-2">
              <input
                placeholder="नाम"
                value={memberForm.name}
                onChange={(e) => setMemberForm((m) => ({ ...m, name: e.target.value }))}
                className="w-full p-2 border rounded"
              />
              <input
                placeholder="पद (जैसे: सुरक्षा प्रमुख / निगरानी / अवरग / सहायक)"
                value={memberForm.position}
                onChange={(e) => setMemberForm((m) => ({ ...m, position: e.target.value }))}
                className="w-full p-2 border rounded"
              />
              <input
                placeholder="काम / ज़िम्मेदारी"
                value={memberForm.work}
                onChange={(e) => setMemberForm((m) => ({ ...m, work: e.target.value }))}
                className="w-full p-2 border rounded"
              />

              <div className="flex items-center gap-3">
                <input
                  id="memberPhoto"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePhotoUpload(e.target.files?.[0], (setter) => setMemberForm((m) => ({ ...m, photoDataUrl: m.photoDataUrl })))}
                  className=""
                />
                {/* The above onChange uses a setter wrapper — but we already have helper function below to set directly */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => setMemberForm((m) => ({ ...m, photoDataUrl: ev.target.result }));
                    reader.readAsDataURL(f);
                  }}
                />
              </div>

              {memberForm.photoDataUrl && (
                <div className="mt-2">
                  <div className="text-xs text-gray-600">Preview:</div>
                  <img src={memberForm.photoDataUrl} alt="preview" className="w-24 h-24 object-cover rounded mt-1 border" />
                </div>
              )}

              <div className="flex gap-2">
                <button className="px-3 py-1 bg-blue-600 text-white rounded" type="submit">जोड़ें</button>
                <button type="button" onClick={() => setMemberForm({ name: "", position: "", work: "", photoDataUrl: "" })} className="px-3 py-1 border rounded">रद्द करें</button>
              </div>

              <hr className="my-3" />

              <h3 className="font-semibold">सदस्य सूची</h3>
              <div className="grid grid-cols-1 gap-2 mt-2">
                {data.members.length === 0 && <div className="text-sm text-gray-500">कोई सदस्य नहीं जोड़ा गया</div>}
                {data.members.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 p-2 border rounded">
                    <div className="w-14 h-14 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      {m.photo ? (
                        <img src={m.photo} alt={m.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Photo</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{m.name}</div>
                      <div className="text-sm text-gray-600">{m.position} — {m.work}</div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button onClick={() => removeMember(m.id)} className="text-sm px-2 py-1 border rounded">हटाएं</button>
                    </div>
                  </div>
                ))}
              </div>
            </form>
          </section>

          {/* Ideas panel */}
          <section className="p-4 border rounded">
            <h2 className="font-semibold mb-3">सुरक्षा विचार (Ideas)</h2>
            <form onSubmit={submitIdea} className="space-y-2">
              <input
                placeholder="शीर्षक"
                value={ideaForm.title}
                onChange={(e) => setIdeaForm((s) => ({ ...s, title: e.target.value }))}
                className="w-full p-2 border rounded"
              />
              <textarea
                placeholder="विचार का बर्णन"
                value={ideaForm.description}
                onChange={(e) => setIdeaForm((s) => ({ ...s, description: e.target.value }))}
                className="w-full p-2 border rounded"
                rows={3}
              />

              <div>
                <input type="file" accept="image/*" onChange={(e) => handleIdeaImageUpload(e.target.files?.[0])} />
                {ideaForm.imageDataUrl && <img src={ideaForm.imageDataUrl} className="mt-2 w-32 h-32 object-cover rounded" alt="idea" />}
              </div>

              <div className="flex gap-2">
                <button className="px-3 py-1 bg-green-600 text-white rounded" type="submit">विचार भेजें</button>
                <button type="button" onClick={() => setIdeaForm({ title: "", description: "", imageDataUrl: "" })} className="px-3 py-1 border rounded">रद्द</button>
              </div>

              <hr />

              <h3 className="font-semibold">आगे की कार्रवाई</h3>
              <div className="space-y-3 mt-3">
                {data.ideas.length === 0 && <div className="text-sm text-gray-500">कोई विचार जमा नहीं हुआ</div>}
                {data.ideas.map((it) => (
                  <div key={it.id} className="border p-3 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{it.title}</div>
                        <div className="text-xs text-gray-500">{new Date(it.submittedAt).toLocaleString()}</div>
                      </div>
                      <div className="text-sm font-semibold">{it.status}</div>
                    </div>
                    {it.image && <img src={it.image} className="mt-2 w-48 h-32 object-cover rounded" alt="idea" />}
                    <p className="mt-2 text-sm">{it.description}</p>
                    <div className="mt-2 flex gap-2">
                      {it.status !== "Action Taken" && (
                        <button className="px-2 py-1 bg-orange-500 text-white rounded text-sm" onClick={() => takeActionOnIdea(it.id)}>Action लो</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </form>
          </section>
        </main>

        <footer className="mt-6 text-sm text-gray-500">यह वेबसाइट एक डेमो है — असली आपरेशन के लिए सर्वर, authentication, और सुरक्षा नियम ज़रूरी हैं।</footer>
      </div>
    </div>
  );
}
