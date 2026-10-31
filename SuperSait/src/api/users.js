const API_URL = 'http://localhost:3001/api/users';

export async function getUsers() {
    const response = await fetch(API_URL);
    if (!response.ok) {
        throw new Error('Ошибка при получении пользователей');
    }
    return await response.json();
}

export async function getUserById(id) {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) {
        throw new Error('Ошибка при получении пользователя');
    }
    return await response.json();
}

export async function attemptLogin(login, password) {
    const response = await fetch(`${API_URL}/login`, {method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({"login": login, "password": password})
    });
    if (!response.ok) {
        throw new Error('Ошибка при попытке входа');
    }
    return await response.json();
}

export async function createUser(userData) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });
    if (!response.ok) {
        const res = await response.json();
        if (res.error == "duplicate key value violates unique constraint \"users_email_key\""){
            return {error: "Пользователь с такой почтой уже существует"}
        }
        else{
            return {error: `Неизвестная ошибка: ${res.error}`}
        }
    }
    return await response.json();
}

export async function updateUser(id, userData) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });
    if (!response.ok) {
        throw new Error('Ошибка при обновлении пользователя');
    }
    return await response.json();
}

export async function deleteUser(id) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Ошибка при удалении пользователя');
    }
    return await response.json();
}
