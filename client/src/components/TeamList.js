import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const TeamList = () => {
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/teams', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTeams(res.data);
        setLoading(false);
      } catch (err) {
        setError((err.response && err.response.data && err.response.data.message) || 'Failed to fetch teams.');
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/teams/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTeams(teams.filter(team => team._id !== id));
      } catch (err) {
        setError((err.response && err.response.data && err.response.data.message) || 'Failed to delete team.');
      }
    }
  };

  if (loading) return <p>Loading teams...</p>;

  return (
    <div>
      <h2>Team Management</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <Link to="/teams/new">Add New Team</Link>
      {teams.length === 0 && !loading && <p>No teams found. Add one!</p>}
      {teams.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Coach</th>
              {/* Add other relevant team fields here */}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teams.map(team => (
              <tr key={team._id}>
                <td>{team.name}</td>
                <td>{team.coach}</td>
                {/* Render other team data */}
                <td>
                  <Link to={`/teams/edit/${team._id}`}>Edit</Link>
                  <button onClick={() => handleDelete(team._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TeamList;
