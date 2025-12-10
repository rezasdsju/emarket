import React from 'react';

const About = () => {
    return (
        <div className="container mt-4">
            <div className="row">
                <div className="col-lg-8 mx-auto">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body p-5">
                            <h1 className="display-5 fw-bold text-center mb-4">
                                <i className="bi bi-info-circle text-primary me-2"></i>
                                আমাদের সম্পর্কে
                            </h1>
                            
                            <div className="text-center mb-5">
                                <div className="display-1 text-primary opacity-25 mb-3">
                                    <i className="bi bi-shop"></i>
                                </div>
                                <p className="lead">
                                    অর্গানিক বাজার - প্রকৃতির সেরা উপহার
                                </p>
                            </div>
                            
                            <div className="row mb-5">
                                <div className="col-md-6 mb-4">
                                    <div className="card border-0 bg-light h-100">
                                        <div className="card-body">
                                            <div className="text-center mb-3">
                                                <i className="bi bi-award display-4 text-success"></i>
                                            </div>
                                            <h4 className="text-center mb-3">আমাদের মিশন</h4>
                                            <p className="text-center">
                                                ১০০% প্রাকৃতিক ও রাসায়নিকমুক্ত পণ্য সরবরাহের মাধ্যমে 
                                                মানুষের স্বাস্থ্য সুরক্ষা করা এবং পরিবেশ বান্ধব জীবনযাপনে সহায়তা করা।
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="col-md-6 mb-4">
                                    <div className="card border-0 bg-light h-100">
                                        <div className="card-body">
                                            <div className="text-center mb-3">
                                                <i className="bi bi-eye display-4 text-primary"></i>
                                            </div>
                                            <h4 className="text-center mb-3">আমাদের ভিশন</h4>
                                            <p className="text-center">
                                                বাংলাদেশের প্রতিটি ঘরে স্বাস্থ্যকর অর্গানিক পণ্য পৌঁছে দেওয়া 
                                                এবং দেশব্যাপী অর্গানিক চাষাবাদকে জনপ্রিয় করা।
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mb-5">
                                <h3 className="border-bottom pb-2 mb-4">
                                    <i className="bi bi-check-circle text-success me-2"></i>
                                    আমাদের বিশেষত্ব
                                </h3>
                                <div className="row">
                                    <div className="col-md-4 mb-3">
                                        <div className="d-flex align-items-start">
                                            <i className="bi bi-shield-check text-success fs-4 me-3"></i>
                                            <div>
                                                <h5>১০০% অর্গানিক</h5>
                                                <p className="text-muted">রাসায়নিক মুক্ত প্রাকৃতিক পণ্য</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <div className="d-flex align-items-start">
                                            <i className="bi bi-truck text-primary fs-4 me-3"></i>
                                            <div>
                                                <h5>সেবা ও বিশ্বস্ততা</h5>
                                                <p className="text-muted">ন্যায্য দামে সেরা পণ্য </p>
                                            </div>
                                        </div>
                                    </div>
                                    {/*
                                    <div className="col-md-4 mb-3">
                                        <div className="d-flex align-items-start">
                                            <i className="bi bi-arrow-repeat text-warning fs-4 me-3"></i>
                                            <div>
                                                <h5>রিটার্ন পলিসি</h5>
                                                <p className="text-muted">৭ দিনের রিটার্ন গ্যারান্টি</p>
                                            </div>
                                        </div>
                                    </div>
                                    */}
                                </div>
                            </div>
                            
                            <div className="mb-5">
                                <h3 className="border-bottom pb-2 mb-4">
                                    <i className="bi bi-telephone text-info me-2"></i>
                                    যোগাযোগ করুন
                                </h3>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <div className="card border-0 bg-light">
                                            <div className="card-body">
                                                <h5>
                                                    <i className="bi bi-geo-alt me-2"></i>
                                                    আমাদের ঠিকানা
                                                </h5>
                                                <p className="mb-0">
                                                    সাভার, ঢাকা, বাংলাদেশ<br />
                                                    অর্গানিক বাজার সেন্টার
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <div className="card border-0 bg-light">
                                            <div className="card-body">
                                                <h5>
                                                    <i className="bi bi-envelope me-2"></i>
                                                    ইমেইল
                                                </h5>
                                                <p className="mb-0">
                                                    support@organicbazar.com<br />
                                                    info@organicbazar.com
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <div className="card border-0 bg-light">
                                            <div className="card-body">
                                                <h5>
                                                    <i className="bi bi-phone me-2"></i>
                                                    ফোন নম্বর
                                                </h5>
                                                <p className="mb-0">
                                                    ০১৭২২২৯২৬০৩<br />
                                                    ০১৯১২৩৪৫৬৭৮
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <div className="card border-0 bg-light">
                                            <div className="card-body">
                                                <h5>
                                                    <i className="bi bi-clock me-2"></i>
                                                    কর্মঘণ্টা
                                                </h5>
                                                <p className="mb-0">
                                                    শনিবার - বৃহস্পতিবার: সকাল ৯টা - রাত ১০টা<br />
                                                    শুক্রবার: বিকাল ৩টা - রাত ১০টা
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="text-center mt-5">
                                <h4 className="mb-3">সামাজিক যোগাযোগ মাধ্যমে যুক্ত থাকুন</h4>
                                <div className="d-flex justify-content-center gap-3">
                                    <a href="#" className="btn btn-primary">
                                        <i className="bi bi-facebook me-1"></i> Facebook
                                    </a>
                                    <a href="#" className="btn btn-info text-white">
                                        <i className="bi bi-messenger me-1"></i> Messenger
                                    </a>
                                    <a href="#" className="btn btn-success">
                                        <i className="bi bi-whatsapp me-1"></i> WhatsApp
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;