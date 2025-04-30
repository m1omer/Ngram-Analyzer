import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend
} from 'recharts';

const COLORS = ['#8e8cf0', '#b2a9f5', '#cabff9'];

export default function Stats({ ngrams, previewText }) {
  const tokens = previewText
    .toLowerCase()
    .match(/\b\w+\b/g) || [];

  const total_tokens = tokens.length;
  const unique_vocab_size = new Set(tokens).size;
  const sentences = previewText.split(/(?<=\.|\?|!)\s/);
  const num_sentences = sentences.length;
  const avg_sentence_length = num_sentences > 0 ? (total_tokens / num_sentences).toFixed(2) : 0;

  const sentence_length_distribution = sentences.map(s => s.split(/\s+/).length);
  const sentenceLengthCounts = sentence_length_distribution.reduce((acc, len) => {
    acc[len] = (acc[len] || 0) + 1;
    return acc;
  }, {});

  const sentenceLengthData = Object.entries(sentenceLengthCounts).map(([length, count]) => ({
    length: +length,
    count,
  }));

  const wordCounts = tokens.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {});
  const topWords = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));

  const sentenceStarters = sentences.map(s => s.trim().split(/\s+/)[0]?.toLowerCase()).filter(Boolean);
  const starterCounts = sentenceStarters.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {});
  const topStarters = Object.entries(starterCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));

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

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        <StatCard value={total_tokens} label="Total Tokens" />
        <StatCard value={unique_vocab_size} label="Unique Vocabulary" />
        <StatCard value={num_sentences} label="Sentences" />
        <StatCard value={avg_sentence_length} label="Avg. Sentence Length" />
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
          <LineChart data={sentenceLengthData} margin={{ bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="length" label={{ value: 'Sentence Length', position: 'insideBottom', offset: -5 }} />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#a892f5" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>

        <h2 style={sectionHeading}>Top Sentence Starters</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topStarters}>
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
                  { name: 'Unique Tokens', value: unique_vocab_size },
                  { name: 'Repeated Tokens', value: total_tokens - unique_vocab_size }
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
