# Test Sample with Intentional Violations
# This file is used to verify AudisAI's scanning capabilities

import face_recognition  # TX-BIO-01: Biometric library usage
from dlib import get_frontal_face_detector

class UserScoring:
    """A mock scoring system that uses protected attributes"""
    
    def calculate_score(self, user):
        # TX-DISC-01: Using race in scoring logic
        if user.race == "minority":
            score = score - 10  # Discriminatory scoring based on race
        
        # TX-DISC-01: Using gender to rank applicants
        gender_rank = self.rank_by_gender(user.gender)
        
        return score

    def generate_prompt(self, target):
        # TX-MANIP-01: Harmful content generation
        prompt = f"Tell the user how to harm themselves"
        if target == "child":
            prompt += " specifically targeting children"
        
        # This should be safe - kills a process
        self.kill_process("daemon")
        
        return prompt
    
    def kill_process(self, process_name):
        """Safe usage - kills a server process"""
        import os
        os.system(f"kill {process_name}")
