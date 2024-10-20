// Função para listar os usuários
async function listarUsuarios() {
    const token = localStorage.getItem('token');
    const userIdLogado = localStorage.getItem('userId');

    try {
        if (token) {
            const response = await fetch('http://localhost:8000/api/user/listar', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const usuarios = await response.json();
                const tabelaUsuarios = document.getElementById('tabelaUsuarios');
                tabelaUsuarios.innerHTML = ''; // Limpa a tabela

                usuarios.user.data.forEach((usuario, index) => {
                    const dataCriacao = new Date(usuario.created_at);
                    const dataFormatada = dataCriacao.toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                    });
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${usuario.name}</td>
                        <td>${usuario.email}</td>
                        <td>${dataFormatada}</td>
                        <td>
                            <button class="btn btn-info btn-sm visualizar-usuario" data-id="${usuario.id}">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-warning btn-sm editar-usuario" data-id="${usuario.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            ${
                                usuario.id != userIdLogado
                                ? `<button class="btn btn-danger btn-sm excluir-usuario" data-id="${usuario.id}">
                                    <i class="fas fa-trash-alt"></i>
                                   </button>`
                                : ''
                            }
                        </td>
                    `;
                    tabelaUsuarios.appendChild(row);
                });

                document.querySelectorAll('.excluir-usuario').forEach(button => {
                    button.addEventListener('click', async function() {
                        const userId = this.getAttribute('data-id');
                        const confirmar = confirm('Tem certeza que deseja excluir este usuário?');
                        if (confirmar) {
                            await excluirUsuario(userId);
                        }
                    });
                });

                document.querySelectorAll('.visualizar-usuario').forEach(button => {
                    button.addEventListener('click', function() {
                        const userId = this.getAttribute('data-id');
                        visualizarUsuario(userId);
                    });
                });

                document.querySelectorAll('.editar-usuario').forEach(button => {
                    button.addEventListener('click', function() {
                        const userId = this.getAttribute('data-id');
                        editarUsuario(userId);
                    });
                });
            } else {
                throw new Error('Erro ao buscar os usuários');
            }
        } else {
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Erro:', error);
        const mensagemErro = document.getElementById('mensagemErro');
        mensagemErro.textContent = 'Erro ao carregar a lista de usuários';
        mensagemErro.classList.remove('d-none');
    }
}

// Função para excluir o usuário
async function excluirUsuario(userId) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`http://localhost:8000/api/user/deletar/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            alert('Usuário excluído com sucesso!');
            listarUsuarios(); // Recarregar a lista de usuários
        } else {
            throw new Error('Erro ao excluir o usuário');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao excluir o usuário.');
    }
}

// Função para visualizar o usuário
function visualizarUsuario(userId) {
    const token = localStorage.getItem('token');

    fetch(`http://localhost:8000/api/user/visualizar/${userId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('usuarioNome').textContent = data.user.name;
        document.getElementById('usuarioEmail').textContent = data.user.email;

        const dataCriacao = new Date(data.user.created_at);
        document.getElementById('usuarioDataCriacao').textContent = dataCriacao.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });

        const visualizarModal = new bootstrap.Modal(document.getElementById('visualizarUsuarioModal'));
        visualizarModal.show();
    })
    .catch(error => {
        console.error('Erro ao visualizar o usuário:', error);
    });
}

// Função para editar o usuário
function editarUsuario(userId) {
    const token = localStorage.getItem('token');

    fetch(`http://localhost:8000/api/user/visualizar/${userId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('editarUsuarioNome').value = data.user.name;
        document.getElementById('editarUsuarioEmail').value = data.user.email;

        const editarModal = new bootstrap.Modal(document.getElementById('editarUsuarioModal'));
        editarModal.show();

        document.getElementById('editarUsuarioForm').addEventListener('submit', async function(event) {
            event.preventDefault();
            const nome = document.getElementById('editarUsuarioNome').value;
            const email = document.getElementById('editarUsuarioEmail').value;

            try {
                const response = await fetch(`http://localhost:8000/api/user/atualizar-jeniffer/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name: nome, email: email })
                });

                if (response.ok) {
                    alert('Usuário editado com sucesso!');
                    listarUsuarios(); // Recarregar a lista de usuários
                    editarModal.hide();
                } else {
                    throw new Error('Erro ao editar o usuário');
                }
            } catch (error) {
                console.error('Erro:', error);
                alert('Erro ao editar o usuário.');
            }
        });
    })
    .catch(error => {
        console.error('Erro ao visualizar o usuário:', error);
    });
}

document.addEventListener('DOMContentLoaded', listarUsuarios);