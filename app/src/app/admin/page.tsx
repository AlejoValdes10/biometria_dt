'use client';

import { useState, useEffect } from 'react';
import { Shield, Trash2, Edit2, X, CheckCircle, AlertCircle } from 'lucide-react';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    progress: number;
    completed: boolean;
    createdAt: string;
}

export default function AdminPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [actionType, setActionType] = useState<'edit' | 'delete'>('edit');

    const [editData, setEditData] = useState<Partial<User>>({});

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users');
            if (!res.ok) throw new Error('Error al cargar usuarios');
            const data = await res.json();
            setUsers(data);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (user: User, action: 'edit' | 'delete') => {
        setSelectedUser(user);
        setActionType(action);
        if (action === 'edit') setEditData(user);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    const handleDelete = async () => {
        if (!selectedUser) return;
        try {
            const res = await fetch(`/api/users?id=${selectedUser.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Error al eliminar');
            setUsers(users.filter(u => u.id !== selectedUser.id));
            closeModal();
        } catch (e: any) {
            alert(e.message);
        }
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        try {
            const res = await fetch('/api/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editData),
            });
            if (!res.ok) throw new Error('Error al actualizar');
            const updatedUser = await res.json();
            setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
            closeModal();
        } catch (e: any) {
            alert(e.message);
        }
    };

    return (
        <div className="min-h-screen bg-surface-900 text-white p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Shield className="w-10 h-10 text-aqua-500" />
                    <h1 className="text-3xl font-bold">Panel de Administración</h1>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-xl mb-6">
                        {error}
                    </div>
                )}

                <div className="bg-surface-800 rounded-2xl overflow-hidden border border-white/5">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-surface-700/50">
                                <tr>
                                    <th className="p-4 font-semibold text-gray-300">ID</th>
                                    <th className="p-4 font-semibold text-gray-300">Nombre</th>
                                    <th className="p-4 font-semibold text-gray-300">Email</th>
                                    <th className="p-4 font-semibold text-gray-300">Rol</th>
                                    <th className="p-4 font-semibold text-gray-300">Estado</th>
                                    <th className="p-4 font-semibold text-gray-300 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-gray-500">
                                            Cargando usuarios...
                                        </td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-gray-500">
                                            No hay usuarios registrados.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map(user => (
                                        <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-4 text-xs font-mono text-gray-500">{user.id.slice(0, 8)}...</td>
                                            <td className="p-4 font-medium">{user.name}</td>
                                            <td className="p-4 text-gray-400">{user.email}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    {user.completed ? (
                                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                                    ) : (
                                                        <AlertCircle className="w-4 h-4 text-orange-500" />
                                                    )}
                                                    <span className="text-sm">
                                                        {user.completed ? 'Completado' : `${user.progress}%`}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => openModal(user, 'edit')}
                                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => openModal(user, 'delete')}
                                                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400 hover:text-red-300"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {isModalOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-surface-800 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <h3 className="text-lg font-semibold">
                                {actionType === 'edit' ? 'Editar Usuario' : 'Eliminar Usuario'}
                            </h3>
                            <button onClick={closeModal} className="p-1 hover:bg-white/10 rounded-lg text-gray-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            {actionType === 'delete' ? (
                                <div>
                                    <p className="text-gray-300 mb-6">
                                        ¿Estás seguro que deseas eliminar al usuario <strong className="text-white">{selectedUser.name}</strong> ({selectedUser.email})?
                                        Esta acción no se puede deshacer.
                                    </p>
                                    <div className="flex justify-end gap-3">
                                        <button onClick={closeModal} className="px-4 py-2 rounded-xl bg-surface-700 hover:bg-surface-600 transition-colors">
                                            Cancelar
                                        </button>
                                        <button onClick={handleDelete} className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 transition-colors text-white font-medium">
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleEdit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Nombre</label>
                                        <input
                                            type="text"
                                            className="w-full bg-surface-900 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-aqua-500"
                                            value={editData.name || ''}
                                            onChange={e => setEditData({ ...editData, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Email</label>
                                        <input
                                            type="email"
                                            className="w-full bg-surface-900 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-aqua-500"
                                            value={editData.email || ''}
                                            onChange={e => setEditData({ ...editData, email: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Rol</label>
                                        <select
                                            className="w-full bg-surface-900 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-aqua-500"
                                            value={editData.role || 'user'}
                                            onChange={e => setEditData({ ...editData, role: e.target.value })}
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div className="flex justify-end gap-3 mt-6">
                                        <button type="button" onClick={closeModal} className="px-4 py-2 rounded-xl bg-surface-700 hover:bg-surface-600 transition-colors">
                                            Cancelar
                                        </button>
                                        <button type="submit" className="px-4 py-2 rounded-xl bg-aqua-600 hover:bg-aqua-500 transition-colors text-white font-medium">
                                            Guardar Cambios
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
