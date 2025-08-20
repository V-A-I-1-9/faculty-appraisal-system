import React, { useMemo } from 'react';

const Part2_Section8a = ({ data, setData, isHodView = false, hodData, setHodData }) => {
    const apiScore = useMemo(() => {
        const num = parseInt(data?.count || 0, 10);
        return num >= 1 ? 40 : 0;
    }, [data]);

    const handleChange = (e) => {
        const stateSetter = isHodView ? setHodData : setData;
        stateSetter({ ...data, count: e.target.value });
    };

    // Staff View
    if (!isHodView) {
        return (
            <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '5px' }}>
                <h4>8.a. No. of projects guided (UG/PG)</h4>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <label>Number of Projects</label>
                    <input type="number" placeholder="Enter count" value={data?.count || ''} onChange={handleChange} />
                </div>
                <hr />
                <p><strong>API Score for this section: {apiScore} / 40</strong></p>
            </div>
        );
    }

    // HOD View
    return (
        <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '5px' }}>
            <h4>8.a. No. of projects guided (UG/PG)</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '10px', fontWeight: 'bold' }}>
                <span>Parameter</span>
                <span style={{textAlign: 'center'}}>SR</span>
                <span style={{textAlign: 'center'}}>HR</span>
            </div>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '10px', alignItems: 'center', marginTop: '0.5rem' }}>
                <label>Number of Projects</label>
                <input type="number" value={data?.count || 0} disabled style={{width: '60px', textAlign: 'center'}} />
                <input type="number" name="count" value={hodData?.count || ''} onChange={handleChange} style={{width: '60px'}} />
            </div>
        </div>
    );
};

export default Part2_Section8a;