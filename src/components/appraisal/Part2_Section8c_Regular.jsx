import React, { useMemo } from 'react';

const Part2_Section8c_Regular = ({ data, setData, isHodView = false, hodData, setHodData }) => {
    const apiScore = useMemo(() => {
        const percent = parseInt(data?.graduated_percent || 0, 10);
        if (percent >= 90) return 30;
        if (percent >= 81) return 25;
        if (percent >= 71) return 20;
        if (percent >= 61) return 15;
        return 0;
    }, [data]);

    const handleChange = (e) => {
        const stateSetter = isHodView ? setHodData : setData;
        stateSetter({ ...data, graduated_percent: e.target.value });
    };

    if (!isHodView) {
        return (
            <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '5px' }}>
                <h4>8.c. Vertical progression under your mentorship</h4>
                <label>% of students graduated</label>
                <input type="number" name="graduated_percent" value={data?.graduated_percent || ''} onChange={handleChange} />
                <hr />
                <p><strong>API Score for this section: {apiScore} / 30</strong></p>
            </div>
        );
    }
    
    return (
        <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '5px' }}>
            <h4>8.c. Vertical progression under your mentorship</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '10px', fontWeight: 'bold' }}>
                <span>Parameter</span>
                <span style={{textAlign: 'center'}}>SR (%)</span>
                <span style={{textAlign: 'center'}}>HR (%)</span>
            </div>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '10px', alignItems: 'center', marginTop: '0.5rem' }}>
                <label>% of students graduated</label>
                <input type="number" value={data?.graduated_percent || 0} disabled style={{width: '60px', textAlign: 'center'}} />
                <input type="number" name="graduated_percent" value={hodData?.graduated_percent || ''} onChange={handleChange} style={{width: '60px'}} />
            </div>
        </div>
    );
};

export default Part2_Section8c_Regular;