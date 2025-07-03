-- Initial Conditions
INSERT INTO conditions (id, name, description, symptoms, severity, requires_doctor_visit, is_emergency, advice)
VALUES 
('cond-cold-001', 'Common Cold', 'A viral infection affecting the upper respiratory tract', 
 '["runny nose", "congestion", "sneezing", "sore throat", "cough", "mild fever"]', 
 'mild', 0, 0, 
 'Rest, stay hydrated, use a humidifier, and consider zinc supplements within 24 hours of symptom onset');

INSERT INTO conditions (id, name, description, symptoms, severity, requires_doctor_visit, is_emergency, advice)
VALUES 
('cond-flu-001', 'Influenza (Flu)', 'A contagious respiratory illness caused by influenza viruses', 
 '["fever", "chills", "body aches", "fatigue", "cough", "headache", "sore throat"]', 
 'moderate', 0, 0, 
 'Rest, stay hydrated, isolate to prevent spreading, and consider antiviral medication if diagnosed early');

INSERT INTO conditions (id, name, description, symptoms, severity, requires_doctor_visit, is_emergency, advice)
VALUES 
('cond-headache-001', 'Headache', 'Pain in the head or upper neck region', 
 '["head pain", "pressure", "tension", "throbbing", "dizziness"]', 
 'mild', 0, 0, 
 'Rest in a quiet, dark room, stay hydrated, apply cold or warm compress, and maintain regular sleep schedule');

INSERT INTO conditions (id, name, description, symptoms, severity, requires_doctor_visit, is_emergency, advice)
VALUES 
('cond-migraine-001', 'Migraine', 'A type of headache that can cause severe throbbing pain or a pulsing sensation', 
 '["severe headache", "throbbing pain", "nausea", "vomiting", "light sensitivity", "sound sensitivity", "vision changes"]', 
 'moderate', 1, 0, 
 'Rest in a dark, quiet room, try cold compresses on your forehead, maintain a consistent sleep schedule, and stay hydrated');

INSERT INTO conditions (id, name, description, symptoms, severity, requires_doctor_visit, is_emergency, advice)
VALUES 
('cond-heart-attack-001', 'Heart Attack', 'A blockage of blood flow to the heart muscle', 
 '["chest pain", "pressure", "shortness of breath", "pain radiating to arm", "nausea", "cold sweat", "fatigue"]', 
 'severe', 1, 1, 
 'Call emergency services immediately. If conscious, chew aspirin and rest in comfortable position');

-- Initial Medicines
INSERT INTO medicines (id, name, generic_name, description, requires_prescription, category, dosage)
VALUES 
('med-acet-001', 'Tylenol', 'Acetaminophen', 'Reduces fever and relieves pain', 0, '["pain reliever", "fever reducer"]', 'Adults: 325-650 mg every 4-6 hours as needed, not exceeding 3000 mg per day');

INSERT INTO medicines (id, name, generic_name, description, requires_prescription, category, dosage)
VALUES 
('med-ibup-001', 'Advil', 'Ibuprofen', 'Reduces inflammation, pain, and fever', 0, '["NSAID", "pain reliever", "fever reducer", "anti-inflammatory"]', 'Adults: 200-400 mg every 4-6 hours as needed, not exceeding 1200 mg per day');

INSERT INTO medicines (id, name, generic_name, description, requires_prescription, category, dosage)
VALUES 
('med-dext-001', 'Robitussin DM', 'Dextromethorphan', 'Suppresses cough', 0, '["cough suppressant"]', 'Adults: 10-20 mg every 4 hours or 30 mg every 6-8 hours, not exceeding 120 mg per day');

INSERT INTO medicines (id, name, generic_name, description, requires_prescription, category, dosage)
VALUES 
('med-pseud-001', 'Sudafed', 'Pseudoephedrine', 'Relieves nasal congestion', 0, '["decongestant"]', 'Adults: 30-60 mg every 4-6 hours, not exceeding 240 mg per day');

INSERT INTO medicines (id, name, generic_name, description, requires_prescription, category, dosage)
VALUES 
('med-aspir-001', 'Aspirin', 'Acetylsalicylic acid', 'Pain relief and anti-inflammatory, avoid in children', 0, '["NSAID", "pain reliever", "fever reducer", "anti-inflammatory"]', 'Adults: 325-650 mg every 4-6 hours as needed, not exceeding 4000 mg per day');

INSERT INTO medicines (id, name, generic_name, description, requires_prescription, category, dosage)
VALUES 
('med-sumat-001', 'Imitrex', 'Sumatriptan', 'Specifically for migraine headaches', 1, '["anti-migraine", "triptan"]', 'Adults: 25-100 mg at onset of migraine, may repeat after 2 hours if needed, not exceeding 200 mg per day');

INSERT INTO medicines (id, name, generic_name, description, requires_prescription, category, dosage)
VALUES 
('med-osel-001', 'Tamiflu', 'Oseltamivir', 'Antiviral that can shorten flu duration if taken early', 1, '["antiviral", "flu treatment"]', 'Adults: 75 mg twice daily for 5 days');

-- Associate Medicines with Conditions
-- Common Cold Medicines
INSERT INTO medicine_conditions (medicine_id, condition_id) VALUES ('med-acet-001', 'cond-cold-001');
INSERT INTO medicine_conditions (medicine_id, condition_id) VALUES ('med-dext-001', 'cond-cold-001');
INSERT INTO medicine_conditions (medicine_id, condition_id) VALUES ('med-pseud-001', 'cond-cold-001');

-- Flu Medicines
INSERT INTO medicine_conditions (medicine_id, condition_id) VALUES ('med-acet-001', 'cond-flu-001');
INSERT INTO medicine_conditions (medicine_id, condition_id) VALUES ('med-ibup-001', 'cond-flu-001');
INSERT INTO medicine_conditions (medicine_id, condition_id) VALUES ('med-osel-001', 'cond-flu-001');
INSERT INTO medicine_conditions (medicine_id, condition_id) VALUES ('med-pseud-001', 'cond-flu-001');

-- Headache Medicines
INSERT INTO medicine_conditions (medicine_id, condition_id) VALUES ('med-acet-001', 'cond-headache-001');
INSERT INTO medicine_conditions (medicine_id, condition_id) VALUES ('med-ibup-001', 'cond-headache-001');
INSERT INTO medicine_conditions (medicine_id, condition_id) VALUES ('med-aspir-001', 'cond-headache-001');

-- Migraine Medicines
INSERT INTO medicine_conditions (medicine_id, condition_id) VALUES ('med-sumat-001', 'cond-migraine-001');
INSERT INTO medicine_conditions (medicine_id, condition_id) VALUES ('med-ibup-001', 'cond-migraine-001');
INSERT INTO medicine_conditions (medicine_id, condition_id) VALUES ('med-acet-001', 'cond-migraine-001');

-- Heart Attack Medicines (emergency)
INSERT INTO medicine_conditions (medicine_id, condition_id) VALUES ('med-aspir-001', 'cond-heart-attack-001'); 