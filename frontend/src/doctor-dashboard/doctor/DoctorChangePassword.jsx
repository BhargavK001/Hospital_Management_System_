import React from "react";
import DoctorLayout from "../layouts/DoctorLayout";
import ChangePasswordForm from "../../common/ChangePasswordForm";

const DoctorChangePassword = () => {
  return (
    <DoctorLayout>
      <div className="container-fluid py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <ChangePasswordForm />
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
};

export default DoctorChangePassword;
