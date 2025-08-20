import React from 'react';

const Part2_Section9b = ({ data, setData, isHodView = false, hodData, setHodData }) => {
    
    const handleChange = (e) => {
        const stateSetter = isHodView ? setHodData : setData;
        const value = e.target.value;
        stateSetter({ ...data, score: value > 35 ? 35 : value });
    };

    if (!isHodView) {
        return (
            <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '5px' }}>
                <h4>9.b. Use of ICT in TLP (Teaching Learning Process)</h4>
                <label>Self-Rating (Max 35)</label>
                <input type="number" name="score" value={data?.score || ''} max="35" onChange={handleChange} />
                <hr />
                <p><strong>API Score for this section: {data?.score || 0} / 35</strong></p>
            </div>
        );
    }

    return (
        <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '5px' }}>
            <h4>9.b. Use of ICT in TLP</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '10px', fontWeight: 'bold' }}>
                <span>Parameter</span>
                <span style={{textAlign: 'center'}}>SR</span>
                <span style={{textAlign: 'center'}}>HR</span>
            </div>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '10px', alignItems: 'center', marginTop: '0.5rem' }}>
                <label>Rating (Max 35)</label>
                <input type="number" value={data?.score || 0} disabled style={{width: '60px', textAlign: 'center'}} />
                <input type="number" max="35" name="score" value={hodData?.score || ''} onChange={handleChange} style={{width: '60px'}} />
            </div>
        </div>
    );
};

export default Part2_Section9b;