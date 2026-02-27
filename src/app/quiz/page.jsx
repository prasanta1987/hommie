"use client";
import { useState, useEffect } from 'react';
import { setValueToDatabase } from '@/app/miscFunctions/actions';
import { useAuth, useRTDB } from '@/hooks/firebaseHooks';
import { Spinner } from 'react-bootstrap';
import { FiEdit3, FiTrash2 } from 'react-icons/fi'

export default function QuizPage() {
    const [quizzes, setQuizzes] = useState([]);
    const [form, setForm] = useState({ type: 'math', question: '', a: '', b: '', c: '', answer: '' });
    const [editingId, setEditingId] = useState(null); // Track if we are editing

    const { user, loading, error } = useAuth();
    const { data, loading: dataLoading, error: dataError } = useRTDB(`quizzes`);

    useEffect(() => {
        if (data) {
            // Flatten the nested categories into a single array
            const allQuizzes = Object.keys(data).flatMap(category => {
                const categoryData = data[category];

                // Map each quiz in this category
                return Object.keys(categoryData).map(quizId => ({
                    id: quizId,
                    category: category, // useful for filtering
                    ...categoryData[quizId]
                }));
            });

            setQuizzes(allQuizzes.reverse());
        } else {
            setQuizzes([]);
        }
    }, [data]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.answer) return alert("Please select the correct answer!");

        // If editing, use the old ID; if new, generate a timestamp ID
        const id = editingId || `q_${Date.now()}`;
        const reference = `quizzes/${form.type}/${id}`;

        try {
            await setValueToDatabase(reference, form);
            alert(editingId ? "Question Updated!" : "Question Saved!");
            setForm({ type: 'math', question: '', a: '', b: '', c: '', answer: '' });
            setEditingId(null);
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = (quiz) => {
        setForm({
            type: quiz.type,
            question: quiz.question,
            a: quiz.a,
            b: quiz.b,
            c: quiz.c,
            answer: quiz.answer
        });
        setEditingId(quiz.id);
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll up to the form
    };

    const handleDelete = async (id) => {
        if (confirm("Are you sure you want to delete this question?")) {
            const reference = `quizzes/${id}`;
            // Using your helper to set value to null for deletion
            await setValueToDatabase(reference, null);
        }
    };


    if (dataLoading) {
        return (
            <div className='text-center bg-dark flex-grow-1 d-flex justify-content-center align-items-center'>
                <Spinner animation="grow" variant="info" size="lg" />
            </div>
        );
    }


    return (
        <div className="container py-5">
            {/* FORM SECTION */}
            <div className="card shadow mb-5 border-primary">
                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                    <h4 className="mb-0">{editingId ? "📝 Edit Question" : "➕ Add New Question"}</h4>
                    {editingId && <button className="btn btn-sm btn-light" onClick={() => { setEditingId(null); setForm({ type: 'math', question: '', a: '', b: '', c: '', answer: '' }); }}>Cancel Edit</button>}
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        {/* ... (Existing form inputs for type, question, options a,b,c, and answer dropdown) ... */}
                        <div className="row">
                            <div className="col-md-4 mb-3">
                                <label className="form-label fw-bold">Type</label>
                                <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                                    <option value="math">Math</option>
                                    <option value="spelling">Spelling</option>
                                    <option value="gk">General Knowledge</option>
                                </select>
                            </div>
                            <div className="col-md-8 mb-3">
                                <label className="form-label fw-bold">Question</label>
                                <input className="form-control" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} required />
                            </div>
                        </div>
                        <div className="row g-2 mb-3">
                            {['a', 'b', 'c'].map(opt => (
                                <div className="col-4" key={opt}>
                                    <input className="form-control" placeholder={`Option ${opt.toUpperCase()}`} value={form[opt]} onChange={(e) => setForm({ ...form, [opt]: e.target.value })} required />
                                </div>
                            ))}
                        </div>
                        <div className="mb-3">
                            <select className="form-select border-success" value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} required>
                                <option value="">-- Select Correct Answer --</option>
                                {form.a && <option value={form.a}>{form.a}</option>}
                                {form.b && <option value={form.b}>{form.b}</option>}
                                {form.c && <option value={form.c}>{form.c}</option>}
                            </select>
                        </div>
                        <button type="submit" className={`btn w-100 fw-bold ${editingId ? 'btn-success' : 'btn-primary'}`}>
                            {editingId ? "Update Question" : "Save Question"}
                        </button>
                    </form>
                </div>
            </div>

            {/* TABLE SECTION */}
            <div className="card shadow mt-4">
                <div className="card-header bg-dark text-white">
                    <h5 className="mb-0">Question Bank ({quizzes.length})</h5>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Type</th>
                                <th>Question</th>
                                <th className='d-none d-md-table-cell'>Options</th>
                                <th>Answer</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quizzes.map((q) => (
                                <tr className='' key={q.id}>
                                    <td><span className="badge bg-info text-dark">{q.type}</span></td>
                                    <td className="fw-bold">{q.question}</td>
                                    <td className='d-none d-md-table-cell'><small>{q.a} | {q.b} | {q.c}</small></td>
                                    <td className="text-success fw-bold">{q.answer}</td>
                                    <td className="text-center">
                                        <div className="btn-group">
                                            <button onClick={() => handleEdit(q)} className="btn btn-sm btn-outline-primary">
                                                <FiEdit3 />
                                            </button>
                                            <button onClick={() => handleDelete(q.id)} className="btn btn-sm btn-outline-danger">
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
