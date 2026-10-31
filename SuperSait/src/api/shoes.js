const API_URL = 'http://localhost:3001/api/shoes';

export async function getShoes() {
    const response = await fetch(API_URL);
    if (!response.ok) {
        throw new Error('Ошибка при получении ботинков');
    }
    return await response.json();
}

export async function getShoeById(id) {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) {
        throw new Error('Ошибка при получении ботинка');
    }
    return await response.json();
}

export async function createShoe(shoeData) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(shoeData),
    });
    if (!response.ok) {
        throw new Error('Ошибка при создании ботинка');
    }
    return await response.json();
}

export async function updateShoe(id, shoeData) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(shoeData),
    });
    if (!response.ok) {
        throw new Error('Ошибка при обновлении ботинка');
    }
    return await response.json();
}

export async function deleteShoe(id) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Ошибка при удалении ботинка');
    }
    return await response.json();
}
