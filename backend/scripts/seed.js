import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import Message from '../models/Message.js';
import connectDB from '../config/db.js';

dotenv.config();

const standardAvailability = [
  { day: 'Monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
  { day: 'Tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
  { day: 'Wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
  { day: 'Thursday', startTime: '09:00', endTime: '17:00', isAvailable: true },
  { day: 'Friday', startTime: '09:00', endTime: '17:00', isAvailable: true },
  { day: 'Saturday', startTime: '09:00', endTime: '13:00', isAvailable: false },
  { day: 'Sunday', startTime: '09:00', endTime: '13:00', isAvailable: false },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('[Seed] Clearing existing collections...');
    await User.deleteMany();
    await Appointment.deleteMany();
    await Message.deleteMany();

    console.log('[Seed] Seeding users (Admin, Doctors, Patients)...');

    // 1. Create Admin
    const admin = await User.create({
      name: 'Hospital Administrator',
      email: 'admin@hospital.com',
      password: 'Password123!',
      role: 'admin',
      phone: '+1 (555) 010-0001',
      gender: 'Male',
      address: '100 Medical Center Way, Suite 100',
    });

    // 2. Create Doctors
    const doctors = await User.create([
      {
        name: 'Dr. Sarah Johnson',
        email: 'dr.sarah@hospital.com',
        password: 'Password123!',
        role: 'doctor',
        phone: '+1 (555) 010-0002',
        gender: 'Female',
        department: 'Cardiology',
        specialization: 'Interventional Cardiology',
        qualification: 'MD, FACC, Harvard Medical School',
        experienceYears: 14,
        doctorFee: 800,
        bio: 'Specialist in coronary artery disease, structural heart conditions, and preventive cardiac care.',
        availability: standardAvailability,
        isActive: true,
      },
      {
        name: 'Dr. Robert Chen',
        email: 'dr.chen@hospital.com',
        password: 'Password123!',
        role: 'doctor',
        phone: '+1 (555) 010-0003',
        gender: 'Male',
        department: 'Neurology',
        specialization: 'Cognitive & Clinical Neurology',
        qualification: 'MD, PhD, Johns Hopkins Medicine',
        experienceYears: 18,
        doctorFee: 950,
        bio: 'Expert in neurological evaluations, migraine management, stroke recovery, and neuromuscular disorders.',
        availability: standardAvailability,
        isActive: true,
      },
      {
        name: 'Dr. Emily Rodriguez',
        email: 'dr.emily@hospital.com',
        password: 'Password123!',
        role: 'doctor',
        phone: '+1 (555) 010-0004',
        gender: 'Female',
        department: 'Pediatrics',
        specialization: 'Pediatric Care & Child Wellness',
        qualification: 'MD, FAAP, Stanford University',
        experienceYears: 10,
        doctorFee: 600,
        bio: 'Compassionate pediatric specialist caring for newborns, infants, children, and adolescents.',
        availability: standardAvailability,
        isActive: true,
      },
      {
        name: 'Dr. James Wilson',
        email: 'dr.wilson@hospital.com',
        password: 'Password123!',
        role: 'doctor',
        phone: '+1 (555) 010-0005',
        gender: 'Male',
        department: 'Orthopedics',
        specialization: 'Joint Replacement & Sports Medicine',
        qualification: 'MS, MCh (Orth), Oxford Medical',
        experienceYears: 16,
        doctorFee: 850,
        bio: 'Pioneering orthopedic surgeon specializing in knee and hip arthroplasty, and sports trauma recovery.',
        availability: standardAvailability,
        isActive: true,
      },
      {
        name: 'Dr. Priya Patel',
        email: 'dr.priya@hospital.com',
        password: 'Password123!',
        role: 'doctor',
        phone: '+1 (555) 010-0006',
        gender: 'Female',
        department: 'General Medicine',
        specialization: 'Internal Medicine & Chronic Care',
        qualification: 'MBBS, MD, All India Institute of Medical Sciences',
        experienceYears: 12,
        doctorFee: 500,
        bio: 'Focused on comprehensive adult healthcare, diabetes management, hypertension, and preventive checkups.',
        availability: standardAvailability,
        isActive: true,
      },
      {
        name: 'Dr. Michael Adams',
        email: 'dr.adams@hospital.com',
        password: 'Password123!',
        role: 'doctor',
        phone: '+1 (555) 010-0007',
        gender: 'Male',
        department: 'Dermatology',
        specialization: 'Clinical & Cosmetic Dermatology',
        qualification: 'MD, American Board of Dermatology',
        experienceYears: 8,
        doctorFee: 700,
        bio: 'Providing diagnosis and treatment for eczema, psoriasis, acne therapies, and laser skin treatments.',
        availability: standardAvailability,
        isActive: true,
      },
    ]);

    // 3. Create Patients
    const patientJohn = await User.create({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'Password123!',
      role: 'patient',
      phone: '+1 (555) 019-1122',
      gender: 'Male',
      dob: '1990-05-15',
      address: '742 Evergreen Terrace, Springfield',
    });

    const patientJane = await User.create({
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      password: 'Password123!',
      role: 'patient',
      phone: '+1 (555) 019-3344',
      gender: 'Female',
      dob: '1985-09-22',
      address: '123 Maple Street, Metro City',
    });

    console.log('[Seed] Seeding realistic sample appointments...');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const inTwoDays = new Date();
    inTwoDays.setDate(inTwoDays.getDate() + 2);
    const inTwoDaysStr = inTwoDays.toISOString().split('T')[0];

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 3);
    const pastDateStr = pastDate.toISOString().split('T')[0];

    await Appointment.create([
      {
        patient: patientJohn._id,
        doctor: doctors[0]._id, // Dr. Sarah (Cardiology)
        department: 'Cardiology',
        appointmentDate: tomorrowStr,
        appointmentTimeSlot: '10:00 - 10:30',
        reason: 'Periodic heart palpitations after exercise and routine ECG checkup.',
        status: 'pending',
        fee: 800,
      },
      {
        patient: patientJohn._id,
        doctor: doctors[4]._id, // Dr. Priya (General Medicine)
        department: 'General Medicine',
        appointmentDate: inTwoDaysStr,
        appointmentTimeSlot: '11:00 - 11:30',
        reason: 'Annual comprehensive health checkup and blood pressure monitoring.',
        status: 'accepted',
        fee: 500,
        doctorNotes: 'Please bring your previous blood test reports and fasting records.',
      },
      {
        patient: patientJane._id,
        doctor: doctors[1]._id, // Dr. Robert Chen (Neurology)
        department: 'Neurology',
        appointmentDate: pastDateStr,
        appointmentTimeSlot: '14:00 - 14:30',
        reason: 'Recurrent migraine attacks with visual aura.',
        status: 'completed',
        fee: 950,
        doctorNotes: 'Prescribed prophylactic medication. Recommended maintaining a headache diary and follow up in 4 weeks.',
      },
      {
        patient: patientJane._id,
        doctor: doctors[2]._id, // Dr. Emily (Pediatrics)
        department: 'Pediatrics',
        appointmentDate: tomorrowStr,
        appointmentTimeSlot: '15:00 - 15:30',
        reason: 'Child immunization schedule review and seasonal fever consultation.',
        status: 'accepted',
        fee: 600,
      },
    ]);

    console.log('[Seed] Seeding sample contact inquiries...');
    await Message.create([
      {
        name: 'Michael Green',
        email: 'michael.g@example.com',
        phone: '+1 (555) 012-7788',
        subject: 'Insurance Coverage & Cashless Treatment Inquiry',
        message: 'Hello, do you accept BlueCross BlueShield cashless health insurance policies for inpatient cardiac surgeries?',
        isRead: false,
      },
      {
        name: 'Alice Cooper',
        email: 'alice.c@example.com',
        phone: '+1 (555) 012-9900',
        subject: 'Visiting Hours Inquiry',
        message: 'Could you please let me know the ICU visiting hours for family members?',
        isRead: true,
        replyMessage: 'Dear Alice, ICU visiting hours are strictly 11:00 AM - 12:00 PM and 5:00 PM - 6:00 PM daily with one visitor at a time.',
        repliedAt: new Date(),
      },
    ]);

    console.log('\n======================================================');
    console.log(' DATABASE SEEDING COMPLETED SUCCESSFULLY! ');
    console.log('======================================================\n');
    console.log('DEMO ACCOUNTS READY TO USE:');
    console.log('------------------------------------------------------');
    console.log('1. ADMINISTRATOR:');
    console.log('   Email:    admin@hospital.com');
    console.log('   Password: Password123!');
    console.log('   Role:     admin');
    console.log('   Portal:   Staff Dashboard (http://localhost:5174)');
    console.log('------------------------------------------------------');
    console.log('2. DOCTORS:');
    console.log('   Cardiology:       dr.sarah@hospital.com   | Password123!');
    console.log('   Neurology:        dr.chen@hospital.com    | Password123!');
    console.log('   Pediatrics:       dr.emily@hospital.com   | Password123!');
    console.log('   Orthopedics:      dr.wilson@hospital.com  | Password123!');
    console.log('   General Medicine: dr.priya@hospital.com   | Password123!');
    console.log('   Dermatology:      dr.adams@hospital.com   | Password123!');
    console.log('   Portal:           Staff Dashboard (http://localhost:5174)');
    console.log('------------------------------------------------------');
    console.log('3. PATIENT:');
    console.log('   Email:    john.doe@example.com');
    console.log('   Email 2:  jane.smith@example.com');
    console.log('   Password: Password123!');
    console.log('   Role:     patient');
    console.log('   Portal:   Patient Frontend (http://localhost:5173)');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error);
    process.exit(1);
  }
};

seedDatabase();
