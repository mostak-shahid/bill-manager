import { __ } from "@wordpress/i18n";
import { useOutletContext } from 'react-router-dom';
import {Row, Col, Form } from 'react-bootstrap';
const ArrayInputs = () => {
   const { settings, settingsLoading, handleChange } = useOutletContext();
    return (
        <>
            {console.log('settings', settings)}
            <div className="setting-unit py-4">
                <Row>
                    <Col lg={6}>
                        
                            <h6 className="h6">{__("Radio", "bill-manager")}</h6>
                            <p>{__("Lorem", "bill-manager")}</p>
                        
                    </Col>
                    {
                        !settingsLoading &&
                        <Col lg={6}>                            
                            <Form.Group>           
                                {[1,2,3,4,5,6,7,8].map((n) => (
                                    <Form.Check
                                        inline
                                        name="basic-radio"
                                        type='checkbox'
                                        id={`checkbox-${n}`}
                                        label={`checkbox-${n}`}
                                        value={`checkbox-${n}`}
                                        // onChange={(e) => handleChange('inputs.array_inputs.checkbox', e.target.value)}
                                        // checked={`checkbox-${n}` == settings?.inputs?.array_inputs?.checkbox ? true : false}
                                        checked={Array.isArray(settings?.inputs?.array_inputs?.checkbox) && settings.inputs.array_inputs.checkbox.includes(`checkbox-${n}`)}
                                        onChange={(e) => {
                                            const currentValue = settings?.inputs?.array_inputs?.checkbox || [];
                                            const isChecked = e.target.checked;
                                            const newValue = isChecked 
                                                ? [...currentValue, e.target.value] 
                                                : currentValue.filter(item => item !== e.target.value);
                                            handleChange('inputs.array_inputs.checkbox', newValue);
                                        }}
                                    />
                                ))}
                            </Form.Group>
                        </Col>
                    }
                </Row>
            </div>                 
        </>
    );
};

export default ArrayInputs;