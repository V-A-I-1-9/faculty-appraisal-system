import React, { useMemo } from 'react';

const Part2_Section7c = ({ data, setData, isHodView = false, hodData, setHodData }) => {
    const apiScore = useMemo(() => {
        const score = parseFloat(data?.score || 0);
        return !isNaN(score) && score <= 40 ? score : 0;
    }, [data]);

    const handleChange = (e) => {
        const stateSetter = isHodView ? setHodData : setData;
        stateSetter({ ...data, score: e.target.value > 40 ? 40 : e.target.value });
    };

    // Staff View
    if (!isHodView) {
        return (
            <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '5px' }}>
                <h4>7.c. Student Feedback</h4>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <label>Student Feedback Average (Max 40)</label>
                    <input type="number" placeholder="Enter score" value={data?.score || ''} onChange={handleChange} max="40" />
                </div>
                <hr />
                <p><strong>API Score for this section: {apiScore.toFixed(2)} / 40</strong></p>
            </div>
        );
    }

    // HOD View
    return (
        <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '5px' }}>
            <h4>7.c. Student Feedback</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '10px', fontWeight: 'bold' }}>
                <span>Parameter</span>
                <span style={{textAlign: 'center'}}>SR</span>
                <span style={{textAlign: 'center'}}>HR</span>
            </div>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '10px', alignItems: 'center', marginTop: '0.5rem' }}>
                <label>Student Feedback Average (Max 40)</label>
                <input type="number" value={data?.score || 0} disabled style={{width: '60px', textAlign: 'center'}} />
                <input type="number" max="40" name="score" value={hodData?.score || ''} onChange={handleChange} style={{width: '60px'}} />
            </div>
        </div>
    );
};

export default Part2_Section7c;