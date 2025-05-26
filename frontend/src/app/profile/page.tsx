'use client'

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Camera, Edit } from 'lucide-react';

export default function Profile() {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated]);

    if (!user) {
        return <div>Carregando...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
            <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                <div className="relative px-4 py-10 bg-white mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
                    <div className="max-w-md mx-auto">
                        <div className="divide-y divide-gray-200">
                            <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                                <h2 className="text-2xl font-bold mb-8">Perfil do Usuário</h2>
                                <div className="flex flex-col space-y-4">
                                    <div>
                                        <span className="font-bold">Nome:</span>
                                        <span className="ml-2">{user.nome_usuario}</span>
                                    </div>
                                    <div>
                                        <span className="font-bold">Email:</span>
                                        <span className="ml-2">{user.email_usuario}</span>
                                    </div>
                                    <div>
                                        <span className="font-bold">Tipo de Conta:</span>
                                        <span className="ml-2">
                                            {user.eAdmin ? 'Administrador' : user.ePremium ? 'Premium' : 'Padrão'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
