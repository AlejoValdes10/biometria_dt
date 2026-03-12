'use client';

import { useState, useEffect } from 'react';
import { Shield, Trash2, Edit2, X, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import { getAllUsersAction, updateUserAction, deleteUserAction } from '@/app/actions';

interface User {
    id: string;
    name?: string | null;
    email: string;
    role: string;
    authType?: string | null;
    signatureData?: string | null;
    trainingProgress: {
        totalPoints: number;
        completed: boolean;
        level: string;
    };
    createdDate: string;
}

export default function AdminPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [actionType, setActionType] = useState<'edit' | 'delete' | 'view'>('edit');

    const [editData, setEditData] = useState<Partial<User> & { totalPoints?: number }>({});

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await getAllUsersAction();
            // Map data correctly since dates might not be Date objects from Server Action directly
            setUsers(data as any);
        } catch (e: any) {
            setError(e.message || 'Error cargando usuarios');
        } finally {
            setLoading(false);
        }
    };

    const openModal = (user: User, action: 'edit' | 'delete' | 'view') => {
        setSelectedUser(user);
        setActionType(action);
        if (action === 'edit') setEditData({ ...user, totalPoints: user.trainingProgress?.totalPoints || 0 });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
        setError('');
    };

    const handleDelete = async () => {
        if (!selectedUser) return;
        try {
            const res = await deleteUserAction(selectedUser.id);
            if (!res.success) throw new Error(res.error);
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
            const dataToUpdate = {
                name: editData.name,
                email: editData.email,
                role: editData.role,
                authType: editData.authType,
                totalPoints: Number(editData.totalPoints),
            };
            const res = await updateUserAction(selectedUser.id, dataToUpdate);
            if (!res.success) throw new Error(res.error);

            // Re-fetch users or update locale
            await fetchUsers();
            closeModal();
        } catch (e: any) {
            alert(e.message);
        }
    };

    return (
        <div className="min-h-screen bg-surface-900 text-white p-6 sm:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Shield className="w-10 h-10 text-aqua-500" />
                    <h1 className="text-2xl sm:text-3xl font-bold">Panel de Administración</h1>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-xl mb-6">
                        {error}
                    </div>
                )}

                <div className="bg-surface-800 rounded-2xl overflow-hidden border border-white/5 shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead className="bg-surface-700/50">
                                <tr>
                                    <th className="p-4 font-semibold text-gray-300">ID</th>
                                    <th className="p-4 font-semibold text-gray-300">Nombre</th>
                                    <th className="p-4 font-semibold text-gray-300">Email</th>
                                    <th className="p-4 font-semibold text-gray-300">AuthType</th>
                                    <th className="p-4 font-semibold text-gray-300">Progreso</th>
                                    <th className="p-4 font-semibold text-gray-300 text-center">Completado</th>
                                    <th className="p-4 font-semibold text-gray-300 text-center">Firma</th>
                                    <th className="p-4 font-semibold text-gray-300 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-gray-500">
                                            Cargando usuarios...
                                        </td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-gray-500">
                                            No hay usuarios registrados.
                                        </td>
                                    </tr>
                                ) : (
                                    users.filter(Boolean).map(user => (
                                        <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-4 text-xs font-mono text-gray-500">{user.id.slice(0, 8)}...</td>
                                            <td className="p-4 font-medium">{user.name || <span className="text-gray-500 italic">No registrado</span>}</td>
                                            <td className="p-4 text-gray-400">{user.email}</td>
                                            <td className="p-4">
                                                <span className="px-2 py-1 bg-surface-700 rounded-lg text-xs capitalize text-aqua-300">
                                                    {user.authType || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm">{user.trainingProgress?.totalPoints || 0} pts</span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    {user.trainingProgress?.completed ? (
                                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                                    ) : (
                                                        <AlertCircle className="w-4 h-4 text-orange-500" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                {user.signatureData ? (
                                                    <span className="inline-flex px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Sí</span>
                                                ) : (
                                                    <span className="inline-flex px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full">No</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => openModal(user, 'view')}
                                                        className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors text-blue-400 hover:text-blue-300"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
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
                    <div className="bg-surface-800 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <h3 className="text-lg font-semibold">
                                {actionType === 'edit' ? 'Editar Usuario' : actionType === 'delete' ? 'Eliminar Usuario' : 'Ver Detalles'}
                            </h3>
                            <button onClick={closeModal} className="p-1 hover:bg-white/10 rounded-lg text-gray-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            {actionType === 'view' ? (
                                <div className="space-y-4">
                                    <div className="bg-surface-900 border border-white/10 p-4 rounded-xl">
                                        <p className="text-sm text-gray-400">ID</p>
                                        <p className="font-mono">{selectedUser.id}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-surface-900 border border-white/10 p-4 rounded-xl"><p className="text-sm text-gray-400">Nombre</p><p>{selectedUser.name || 'N/A'}</p></div>
                                        <div className="bg-surface-900 border border-white/10 p-4 rounded-xl"><p className="text-sm text-gray-400">Email</p><p>{selectedUser.email}</p></div>
                                        <div className="bg-surface-900 border border-white/10 p-4 rounded-xl"><p className="text-sm text-gray-400">Rol</p><p className="capitalize">{selectedUser.role}</p></div>
                                        <div className="bg-surface-900 border border-white/10 p-4 rounded-xl"><p className="text-sm text-gray-400">AuthType</p><p className="capitalize text-aqua-400">{selectedUser.authType || 'N/A'}</p></div>
                                    </div>
                                    <div className="bg-surface-900 border border-white/10 p-4 rounded-xl">
                                        <p className="text-sm text-gray-400 mb-2">Progreso de Capacitación</p>
                                        <div className="flex justify-between text-sm"><span>Puntos Totales:</span><span className="font-medium text-aqua-400">{selectedUser.trainingProgress?.totalPoints || 0}</span></div>
                                        <div className="flex justify-between text-sm mt-1"><span>Estado:</span><span>{selectedUser.trainingProgress?.completed ? 'Completado' : 'Pendiente'}</span></div>
                                        <div className="flex justify-between text-sm mt-1"><span>Firma Digital:</span><span>{selectedUser.signatureData ? 'Capturada' : 'No Capturada'}</span></div>
                                    </div>
                                    <div className="flex justify-end mt-4">
                                        <button onClick={closeModal} className="px-4 py-2 rounded-xl bg-surface-700 hover:bg-surface-600 transition-colors text-white">Cerrar</button>
                                    </div>
                                </div>
                            ) : actionType === 'delete' ? (
                                <div>
                                    <p className="text-gray-300 mb-6">
                                        ¿Estás seguro que deseas eliminar al usuario <strong className="text-white">{selectedUser.name || selectedUser.email}</strong>?
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
                                    <div className="grid grid-cols-2 gap-4">
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
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Auth Type</label>
                                            <select
                                                className="w-full bg-surface-900 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-aqua-500"
                                                value={editData.authType || 'fallback'}
                                                onChange={e => setEditData({ ...editData, authType: e.target.value })}
                                            >
                                                <option value="fallback">Fallback</option>
                                                <option value="cara">Cara</option>
                                                <option value="huella">Huella</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Puntos Totales (Progreso)</label>
                                        <input
                                            type="number"
                                            className="w-full bg-surface-900 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-aqua-500"
                                            value={editData.totalPoints || 0}
                                            onChange={e => setEditData({ ...editData, totalPoints: parseInt(e.target.value) || 0 })}
                                        />
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
