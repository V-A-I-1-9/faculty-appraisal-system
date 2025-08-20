import React, { useMemo } from 'react';

const Part2_Section8d = ({ data, setData, isHodView = false, hodData, setHodData }) => {
    const apiScore = useMemo(() => {
        return data?.is_completed === 'yes' ? 10 : 0;
    }, [data]);
    
    const handleChange = (e) => {
        const stateSetter = isHodView ? setHodData : setData;
        stateSetter({ ...data, is_completed: e.target.value });
    };

    if (!isHodView) {
        return (
            <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '5px' }}>
                <h4>8.d. No. of UG/PG projects Co-guided</h4>
                <label>Is project completed?</label>
                <select name="is_completed" value={data?.is_completed || ''} onChange={handleChange}>
                    <option value="">Select Status</option>
                    <option value="yes">Yes, Completed</option>
                    <option value="no">No</option>
                </select>
                <hr />
                <p><strong>API Score for this section: {apiScore} / 10</strong></p>
            </div>
        );
    }

    return (
        <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '5px' }}>
            <h4>8.d. No. of UG/PG projects Co-guided</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '10px', fontWeight: 'bold' }}>
                <span>Parameter</span>
                <span style={{textAlign: 'center'}}>SR</span>
                <span style={{textAlign: 'center'}}>HR</span>
            </div>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '10px', alignItems: 'center', marginTop: '0.5rem' }}>
                <label>Is project completed?</label>
                <input value={data?.is_completed || 'N/A'} disabled style={{width: '100px', textAlign: 'center'}} />
                <select name="is_completed" value={hodData?.is_completed || ''} onChange={handleChange} style={{width: '100px'}}>
                    <option value="">Select Status</option>
                    <option value="yes">Yes, Completed</option>
                    <option value="no">No</option>
                </select>
            </div>
        </div>
    );
};

export default Part2_Section8d;