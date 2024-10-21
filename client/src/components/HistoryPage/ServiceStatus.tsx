import React from "react";

interface Service {
    id: number;
    name: string;
    status: 'running' | 'stopped';
    price: number;
}

interface ServiceStatusProps {
    projectServices: Service[];
}

const ServiceStatus: React.FC<ServiceStatusProps> = (projectServices) => {
    return (
        <div>
            <h3>Service Status</h3>
            {projectServices.projectServices.map((service) => (
                <div key={service.id} className={`service ${service.status}`}>
                    {service.name}: {service.status}
                </div>
            ))}
        </div>
    )
}

export default ServiceStatus