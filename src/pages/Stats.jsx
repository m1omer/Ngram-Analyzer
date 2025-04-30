import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend
} from 'recharts';

const COLORS = ['#8e8cf0', '#b2a9f5', '#cabff9'];

export default function Stats() {
  const [stats, setStats] = useState(null);
  const [topWords, setTopWords] = useState([]);
  const [sentenceStarters, setSentenceStarters] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:8000/stats')
      .then(res => setStats(res.data))
      .catch(err => setError('Please upload a PDF to view insights.'));

    axios.get('http://localhost:8000/top-words')
      .then(res => setTopWords(res.data.top_words.slice(0, 10).map(([word, count]) => ({ word, count }))))
      .catch(err => console.log('Top words fetch error'));

    axios.get('http://localhost:8000/sentence-starters')
      .then(res => {
        setSentenceStarters(res.data.top_starters.map(([word, count]) => ({ word, count })));
      })
      .catch(err => console.log('Sentence starters fetch error'));
  }, []);

  return (
    <div style={{
      backgroundColor: '#f3f4f8',
      minHeight: '100vh',
      padding: '4rem 2rem',
      fontFamily: 'system-ui, sans-serif',
      color: '#1e293b'
    }}>
      <h1 style={{
        fontSize: '2rem',
        fontWeight: '700',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>Document Statistics</h1>

      {error && <div style={{
        backgroundColor: '#fff6f6',
        color: '#7f1d1d',
        padding: '1rem 1.5rem',
        margin: '1rem auto 2rem',
        maxWidth: '600px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        textAlign: 'center'
      }}>{error}</div>}

      {!stats ? <p style={{ textAlign: 'center' }}>Loading...</p> : (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginBottom: '3rem'
          }}>
            <StatCard value={stats.total_tokens} label="Total Tokens" />
            <StatCard value={stats.unique_vocab_size} label="Unique Vocabulary" />
            <StatCard value={stats.num_sentences} label="Sentences" />
            <StatCard value={stats.avg_sentence_length} label="Avg. Sentence Length" />
          </div>

          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={sectionHeading}>Most Frequent Words</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topWords}>
                <XAxis dataKey="word" interval={0} angle={-30} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8e8cf0" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            <h2 style={sectionHeading}>Sentence Length Distribution</h2>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart
                margin={{ bottom: 30 }}
                data={Object.entries(stats.sentence_length_distribution || {}).map(([length, count]) => ({ length: +length, count }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="length" label={{ value: 'Sentence Length', position: 'insideBottom', offset: -5 }} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#a892f5" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>

            <h2 style={sectionHeading}>Top Sentence Starters</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sentenceStarters}>
                <XAxis dataKey="word" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#b2a9f5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            <h2 style={sectionHeading}>Vocabulary Insights</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
              <ResponsiveContainer width={300} height={300}>
                <PieChart>
                  <Pie
                    dataKey="value"
                    data={[
                      { name: 'Unique Tokens', value: stats.unique_vocab_size },
                      { name: 'Repeated Tokens', value: stats.total_tokens - stats.unique_vocab_size }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {COLORS.map((color, index) => <Cell key={index} fill={color} />)}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ value, label }) {
  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '1.5rem',
      textAlign: 'center',
      boxShadow: '0 4px 10px rgba(0,0,0,0.03)'
    }}>
      <div style={{ fontSize: '2rem', fontWeight: '700', color: '#8e8cf0' }}>{value}</div>
      <div style={{ fontSize: '1rem', color: '#555' }}>{label}</div>
    </div>
  );
}

const sectionHeading = {
  fontSize: '1.25rem',
  fontWeight: '600',
  marginTop: '3rem',
  marginBottom: '1rem',
  color: '#1e293b',
  textAlign: 'center'
};
