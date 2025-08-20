import React, { useMemo } from 'react';

const Part2_Section8b = ({ data, setData, isHodView = false, hodData, setHodData }) => {

    const handleOptionChange = (e) => {
        const stateSetter = isHodView ? setHodData : setData;
        stateSetter({ selectedOption: e.target.value, details: {} });
    };

    const handleDetailChange = (e) => {
        const { name, value } = e.target;
        const stateSetter = isHodView ? setHodData : setData;
        const currentData = isHodView ? hodData : data;
        stateSetter({ ...currentData, details: { ...currentData.details, [name]: value } });
    };

    const apiScore = useMemo(() => {
        const { selectedOption, details } = data || {};
        switch (selectedOption) {
            case 'best_project': if (details?.place === '1') return 60; if (details?.place === '2') return 55; if (details?.place === '3') return 50; return 0;
            case 'exhibited': if (details?.status === 'won') return 60; if (details?.status === 'exhibited') return 40; return 0;
            case 'funded': const funds = parseFloat(details?.amount || 0); if (funds >= 5000) return 60; if (funds > 0 && funds < 5000) return 50; return 0;
            case 'publication': const pubs = parseInt(details?.count || 0, 10); if (pubs >= 1) return 60; return 0;
            default: return 0;
        }
    }, [data]);

    const renderDetailFields = (isForHod) => {
        const currentData = isForHod ? hodData : data;
        const changeHandler = handleDetailChange;
        
        // --- THIS IS THE CORRECTED LOGIC ---
        // The fields should only be disabled if it's the HOD view AND we are rendering the SR (staff) side.
        const isDisabled = isHodView && !isForHod;

        switch (currentData?.selectedOption) {
            case 'best_project': return (<select name="place" value={currentData.details?.place || ''} onChange={changeHandler} disabled={isDisabled}><option value="">Select Place</option><option value="1">1st Place</option><option value="2">2nd Place</option><option value="3">3rd Place</option></select>);
            case 'exhibited': return (<select name="status" value={currentData.details?.status || ''} onChange={changeHandler} disabled={isDisabled}><option value="">Select Status</option><option value="won">Won in Competition</option><option value="exhibited">Only Exhibited</option></select>);
            case 'funded': return <input type="number" name="amount" placeholder="Funding Amount (INR)" value={currentData.details?.amount || ''} onChange={changeHandler} disabled={isDisabled} />;
            case 'publication': return <input type="number" name="count" placeholder="No. of Publications" value={currentData.details?.count || ''} onChange={changeHandler} disabled={isDisabled} />;
            default: return <span style={{color: '#888'}}>Select an option to add details.</span>;
        }
    };

    if (!isHodView) {
        return (
            <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '5px' }}>
                <h4>8.b. Best Project Awards / Publications / Funding</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div><input type="radio" id="opt_best_project" name="section8b_option" value="best_project" checked={data?.selectedOption === 'best_project'} onChange={handleOptionChange} /><label htmlFor="opt_best_project"> Best Projects Awarded</label></div>
                    <div><input type="radio" id="opt_exhibited" name="section8b_option" value="exhibited" checked={data?.selectedOption === 'exhibited'} onChange={handleOptionChange} /><label htmlFor="opt_exhibited"> Student Project Exhibited</label></div>
                    <div><input type="radio" id="opt_funded" name="section8b_option" value="funded" checked={data?.selectedOption === 'funded'} onChange={handleOptionChange} /><label htmlFor="opt_funded"> Funded by External Agency</label></div>
                    <div><input type="radio" id="opt_publication" name="section8b_option" value="publication" checked={data?.selectedOption === 'publication'} onChange={handleOptionChange} /><label htmlFor="opt_publication"> Student Project Paper Publication(s)</label></div>
                </div>
                <div style={{ marginTop: '1rem' }}>{renderDetailFields(false)}</div><hr /><p><strong>API Score for this section: {apiScore} / 60</strong></p>
            </div>
        );
    }
    
    return (
        <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '5px' }}>
            <h4>8.b. Best Project Awards / Publications / Funding</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'start' }}>
                <div>
                    <p><strong>Self-Rating (SR)</strong></p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div><input type="radio" value="best_project" checked={data?.selectedOption === 'best_project'} disabled /><label> Best Projects Awarded</label></div>
                        <div><input type="radio" value="exhibited" checked={data?.selectedOption === 'exhibited'} disabled /><label> Student Project Exhibited</label></div>
                        <div><input type="radio" value="funded" checked={data?.selectedOption === 'funded'} disabled /><label> Funded by External Agency</label></div>
                        <div><input type="radio" value="publication" checked={data?.selectedOption === 'publication'} disabled /><label> Student Project Paper Publication(s)</label></div>
                    </div>
                    <div style={{ marginTop: '1rem' }}>{renderDetailFields(false)}</div>
                </div>
                <div>
                    <p><strong>HOD Rating (HR)</strong></p>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div><input type="radio" id="hr_opt_best_project" name="hr_section8b_option" value="best_project" checked={hodData?.selectedOption === 'best_project'} onChange={handleOptionChange} /><label htmlFor="hr_opt_best_project"> Best Projects Awarded</label></div>
                        <div><input type="radio" id="hr_opt_exhibited" name="hr_section8b_option" value="exhibited" checked={hodData?.selectedOption === 'exhibited'} onChange={handleOptionChange} /><label htmlFor="hr_opt_exhibited"> Student Project Exhibited</label></div>
                        <div><input type="radio" id="hr_opt_funded" name="hr_section8b_option" value="funded" checked={hodData?.selectedOption === 'funded'} onChange={handleOptionChange} /><label htmlFor="hr_opt_funded"> Funded by External Agency</label></div>
                        <div><input type="radio" id="hr_opt_publication" name="hr_section8b_option" value="publication" checked={hodData?.selectedOption === 'publication'} onChange={handleOptionChange} /><label htmlFor="hr_opt_publication"> Student Project Paper Publication(s)</label></div>
                    </div>
                    <div style={{ marginTop: '1rem' }}>{renderDetailFields(true)}</div>
                </div>
            </div>
        </div>
    );
};

export default Part2_Section8b;