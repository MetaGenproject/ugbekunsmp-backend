import SchoolRepository from "../repositories/schoolRepository.js";


//To Add or create a school 
export const createSchool =  async(req, res) =>{
    //get the payload 
    const schoolData = {
        ...req.body
        // name, admin,email, plan, status
    } 
    //search if the school already exit using their emails 
    try {
        const existingSchool = await SchoolRepository.findByEmail(req.body.email);

        if (existingSchool) {
            return res
            .status(400)
            .send({ message:'School with this email already exist', status:false}) 
        } 
        //create a new school 
        const newSchool = { 

            name: schoolData.name, 
            email: schoolData.email,
            admin: schoolData.admin, 
            plan: schoolData.plan,
            status: schoolData.status

        } 
        const School = await SchoolRepository.create(newSchool); 
        console.log('School created successfully:', School);
        return res.status(201).send({School, message:"School created successfully"})
        
    } catch (error) {
        console.error('Error creating school:', error);
        res.status(500).send({ message: "An error occurred while creating the school" });
    }
    
    
    
};

//To Edit /update a School details  
export const updateSchool =  async(req, res) =>{
    //pass the school id in the params
    const schoolId = req.params.id; 
    //get the payload from the body
    const schoolData = { ...req.body }; 
    try {
        const existingSchool = await SchoolRepository.findById(schoolId);

        if (!existingSchool) {
            return res
            .status(404)
            .send({ message:'School not found', status:false}) 
        }

        const updatedSchool = await SchoolRepository.update(schoolId, schoolData);

        console.log('School updated successfully:', updatedSchool);
        return res.status(200).send({updatedSchool, message:"School updated successfully"})
   
        
    } catch (error) {
        console.error('Error updating school:', error);
        res.status(500).send({ message: "An error occurred while updating the school" });
    }
    //check if the school exist
    //if it exist update the details
    //if it doesn't exist return an error message 
    
}; 

//To get a school 
export const getSchool =  async(req, res) =>{
    //pass the school id in the params 
    const schoolId = req.params.id; 
    try {
        const existingSchool = await SchoolRepository.findById(schoolId); 

        if (!existingSchool) {
            return res
            .status(404)
            .send({ message:'School not found', status:false}) 
        }
        return res.status(200).send({existingSchool, message:"School found successfully"}) 
    } catch (error) {
        console.error('Error fetching school:', error);
        res.status(500).send({ message: "An error occurred while fetching the school" });
    }
    //displays the school details 
    
}; 

//To get all schools 
export const getSchools =  async(req, res) =>{
    try {
        const schools = await SchoolRepository.findAll(); 
        return res.status(200).send({schools, message:"Schools found successfully"}) 
    } catch (error) {
        console.error('Error fetching schools:', error);
        res.status(500).send({ message: "An error occurred while fetching the schools" });
    }
  
    
}

//To delete school  
export const deleteSchool =  async(req, res) =>{
    //pass the school id in the params 
    const schoolId = req.params.id;
    try {
        const existingSchool = await SchoolRepository.findById(schoolId);
        if (!existingSchool) {
            return res.status(404).send({ message: 'School not found', status: false });
        }
        await SchoolRepository.delete(schoolId);
        console.log('School deleted successfully');
        return res.status(200).send({ message: 'School deleted successfully' });
    } catch (error) {
        console.error('Error deleting school:', error);
        res.status(500).send({ message: "An error occurred while deleting the school" });
    }
    
}