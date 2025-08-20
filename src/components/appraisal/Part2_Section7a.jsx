import React, { useMemo } from 'react';

const Part2_Section7a = ({ data, setData, isHodView = false, hodData, setHodData }) => {
    const subjects = data || [];
    const hodSubjects = hodData || [];

    // --- Staff Functions ---
    const handleSubjectChange = (index, event) => {
        const values = [...subjects];
        values[index][event.target.name] = event.target.value;
        setData(values);
    };

    const addSubject = () => {
        setData([...subjects, { code: '', students: '', passPercent: '' }]);
    };

    const removeSubject = (index) => {
        const values = [...subjects];
        values.splice(index, 1);
        setData(values);
    };
    
    // --- HOD Function ---
    const handleHodSubjectChange = (index, event) => {
        const values = [...hodSubjects];
        // Ensure HOD data structure matches staff data structure
        while (values.length < subjects.length) {
            values.push({ code: '', students: '', passPercent: '' });
        }
        values[index] = { ...values[index], [event.target.name]: event.target.value };
        setHodData(values);
    };

    const staffApiScores = useMemo(() => {
        const scores = subjects.map(sub => (parseFloat(sub.passPercent) || 0) * 0.01 * 30);
        return { scores, averageScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0 };
    }, [subjects]);
    
    // Staff View
    if (!isHodView) {
        return (
            <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '5px' }}>
                <h4>7.a. Subjects Taught & Pass Percentage</h4>
                {subjects.map((subject, index) => (
                    <div key={index} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                        <input type="text" name="code" placeholder="Subject Code" value={subject.code} onChange={e => handleSubjectChange(index, e)} />
                        <input type="number" name="students" placeholder="No. of Students" value={subject.students} onChange={e => handleSubjectChange(index, e)} />
                        <input type="number" name="passPercent" placeholder="% of Pass" value={subject.passPercent} onChange={e => handleSubjectChange(index, e)} />
                        <span>API Score: {staffApiScores.scores[index]?.toFixed(2) || 0}</span>
                        <button type="button" onClick={() => removeSubject(index)}>Remove</button>
                    </div>
                ))}
                <button type="button" onClick={addSubject}>+ Add Subject</button>
                <hr />
                <p><strong>Average API Score for this section: {staffApiScores.averageScore.toFixed(2)} / 30</strong></p>
            </div>
        );
    }
    
    // HOD View
    return (
        <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '5px' }}>
            <h4>7.a. Subjects Taught & Pass Percentage</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '1rem', fontWeight: 'bold' }}>
                <span>Subject Code</span>
                <span>No. of Students</span>
                <span style={{textAlign: 'center'}}>SR (% Pass)</span>
                <span style={{textAlign: 'center'}}>HR (% Pass)</span>
            </div>
            {subjects.map((subject, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' }}>
                    <input type="text" value={subject.code} disabled />
                    <input type="number" value={subject.students} disabled />
                    <input type="number" value={subject.passPercent} disabled style={{textAlign: 'center'}} />
                    <input 
                        type="number" 
                        name="passPercent" 
                        placeholder="% of Pass" 
                        value={hodSubjects[index]?.passPercent || ''}
                        onChange={e => handleHodSubjectChange(index, e)}
                        style={{textAlign: 'center'}}
                    />
                </div>
            ))}
        </div>
    );
};

export default Part2_Section7a;