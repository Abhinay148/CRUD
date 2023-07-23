// UserList.js
import React, { useEffect, useState } from 'react';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [updateUser, setUpdateUser] = useState(null);

  useEffect(() => {
    getNotes();
  }, []);
  const checkLogin = () => {
    if (localStorage.getItem("authToken")) {
      return localStorage.getItem("authToken");
    }
  }
  const [Token, setToken] = useState(checkLogin())
  const getNotes = async () => {
    const response = await fetch("http://localhost:5000/api/auth/fetchalluser", {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        "auth-token": Token
      }
    });
    const json = await response.json()
    return setUsers(json)
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      });

      if (response.ok) {
        console.log('New user created successfully');
        setName('');
        setEmail('');
        fetchUsers(); // Fetch updated user list after creation
      } else {
        console.error('Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();

    if (!updateUser) return;

    try {
      const response = await fetch(`http://localhost:5000/api/auth/updateuser/${updateUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          "auth-token": Token
        },
        body: JSON.stringify({ name, email,password }),
      });

      if (response.ok) {
        console.log('User updated successfully');
        setName('');
        setEmail('');
        setPassword('');
        setUpdateUser(null);
        getNotes(); // Fetch updated user list after update
      } else {
        console.error('Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/auth/deleteuser/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          "auth-token": Token
        }
      });

      if (response.ok) {
        console.log('User deleted successfully');
        getNotes(); // Fetch updated user list after deletion
      } else {
        console.error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleEditUser = (user) => {
    setName(user.name);
    setEmail(user.email);
    setPassword(user.password);
    setUpdateUser(user);
  };

  return (
    <div>
      <h2>User List</h2>
      <ul>
        {users.map((user) => (
          <li key={user._id}>
            {user.name} - {user.email}
            <button onClick={() => handleEditUser(user)}>Edit</button>
            <button onClick={() => handleDeleteUser(user._id)}>Delete</button>
          </li>
        ))}
      </ul>

      <h2>Update User</h2>
      <form onSubmit={updateUser ? handleUpdateUser : handleSubmit}>
        <div>
          <label>Name:</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>New Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">{updateUser ? 'Update' : 'Create'}</button>
      </form>
    </div>
  );
};

export default UserList;
