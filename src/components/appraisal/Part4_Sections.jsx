import React from 'react';

// This version contains the complete code for BOTH the Staff's view and the HOD's review view.
const Part4_Sections = ({ data, setData, isHodView = false, hodData, setHodData }) => {

    const handleChange = (e) => {
        const { name, value } = e.target;
        const max = parseInt(e.target.max, 10);
        if (value > max) return;

        const stateSetter = isHodView ? setHodData : setData;
        stateSetter(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (e) => {
        const { name, value } = e.target;
        const stateSetter = isHodView ? setHodData : setData;
        stateSetter(prev => ({ ...prev, [name]: value }));
    };

    // --- STAFF VIEW ---
    // If it's the staff filling out the form, render this original layout.
    if (!isHodView) {
        return (
            <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '5px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'center' }}>
                    <div><label><strong>13.a.</strong> Punctuality (Max 10)</label><input type="number" max="10" name="punctuality_13a" value={data?.punctuality_13a || ''} onChange={handleChange} /></div>
                    <div><label><strong>13.b.</strong> Behavior and Conduct (Max 15)</label><input type="number" max="15" name="behavior_13b" value={data?.behavior_13b || ''} onChange={handleChange} /></div>
                    <div><label><strong>13.c.</strong> Performance on assigned jobs (Max 15)</label><input type="number" max="15" name="performance_13c" value={data?.performance_13c || ''} onChange={handleChange} /></div>
                    <div><label><strong>13.d.</strong> Upholding Institute's Culture (Max 15)</label><input type="number" max="15" name="culture_13d" value={data?.culture_13d || ''} onChange={handleChange} /></div>
                    <div><label><strong>13.e.</strong> Mentoring Efficacy (Max 20)</label><input type="number" max="20" name="mentoring_13e" value={data?.mentoring_13e || ''} onChange={handleChange} /></div>
                    <div><label><strong>13.f.</strong> Team-man-ship (Max 15)</label><input type="number" max="15" name="teamwork_13f" value={data?.teamwork_13f || ''} onChange={handleChange} /></div>
                    <div><label><strong>14.a.</strong> Academic Preparedness: Course File (Max 30)</label><input type="number" max="30" name="preparedness_14a" value={data?.preparedness_14a || ''} onChange={handleChange} /></div>
                    <div><label><strong>14.b.</strong> Academic Assessment Efficacy (Max 20)</label><input type="number" max="20" name="assessment_14b" value={data?.assessment_14b || ''} onChange={handleChange} /></div>
                    <div>
                        <label><strong>14.c.</strong> Student Activities organized (Max 20)</label>
                        <select name="activities_14c" value={data?.activities_14c || ''} onChange={handleSelectChange}>
                            <option value="">Select Type</option>
                            <option value="co_collab">Co-curricular & Collaborative</option>
                            <option value="co_ind">Co-curricular & Individual</option>
                            <option value="extra_collab">Extra-curricular & Collaborative</option>
                        </select>
                    </div>
                    <div>
                        <label><strong>15.a.</strong> Add-on Responsibilities (Max 20)</label>
                        <select name="responsibilities_15a" value={data?.responsibilities_15a || ''} onChange={handleSelectChange}>
                            <option value="">Select Option</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                        </select>
                    </div>
                </div>
            </div>
        );
    }

    // --- HOD VIEW ---
    // If it's the HOD reviewing the form, render this two-column layout.
    const renderInput = (label, name, max) => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '10px', alignItems: 'center' }}>
            <label><strong>{label}</strong> (Max {max})</label>
            <input type="number" max={max} name={name} value={data?.[name] || ''} disabled style={{width: '60px', textAlign: 'center'}} />
            <input type="number" max={max} name={name} value={hodData?.[name] || ''} onChange={handleChange} style={{width: '60px'}} />
        </div>
    );

    const renderSelect = (label, name, options) => (
         <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '10px', alignItems: 'center' }}>
            <label><strong>{label}</strong></label>
            <input value={data?.[name] || ''} disabled style={{width: '100px', textAlign: 'center', textTransform: 'capitalize'}} />
            <select name={name} value={hodData?.[name] || ''} onChange={handleSelectChange}>
                {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
        </div>
    );

    return (
        <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '5px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '10px', fontWeight: 'bold' }}>
                    <span>Parameter</span>
                    <span style={{textAlign: 'center'}}>SR</span>
                    <span style={{textAlign: 'center'}}>HR</span>
                </div>
                {renderInput("13.a. Punctuality", "punctuality_13a", 10)}
                {renderInput("13.b. Behavior and Conduct", "behavior_13b", 15)}
                {renderInput("13.c. Performance on assigned jobs", "performance_13c", 15)}
                {renderInput("13.d. Upholding Institute's Culture", "culture_13d", 15)}
                {renderInput("13.e. Mentoring Efficacy", "mentoring_13e", 20)}
                {renderInput("13.f. Team-man-ship", "teamwork_13f", 15)}
                {renderInput("14.a. Academic Preparedness: Course File", "preparedness_14a", 30)}
                {renderInput("14.b. Academic Assessment Efficacy", "assessment_14b", 20)}

                {renderSelect("14.c. Student Activities organized", "activities_14c", [
                    { value: "", label: "Select Type" },
                    { value: "co_collab", label: "Co-curricular & Collaborative" },
                    { value: "co_ind", label: "Co-curricular & Individual" },
                    { value: "extra_collab", label: "Extra-curricular & Collaborative" }
                ])}

                {renderSelect("15.a. Add-on Responsibilities", "responsibilities_15a", [
                    { value: "", label: "Select Option" },
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" }
                ])}
            </div>
        </div>
    );
};

export default Part4_Sections;