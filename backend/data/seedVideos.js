import mongoose from "mongoose";
import SkillVideo from "../models/SkillVideo.js";

// Empty videoSeeds array placeholder for custom dataset
export const videoSeeds = [
  {
    skillName: "HTML",
    videos: [
      {
        segment: 1,
        title: "HTML Full Course",
        videoUrl: "https://www.youtube.com/watch?v=G3e-cpL7ofc"
      }
    ]
  },
  {
    skillName: "CSS",
    videos: [
      {
        segment: 1,
        title: "CSS Full Course (Flexbox + Grid)",
        videoUrl: "https://www.youtube.com/watch?v=ieTHC78giGQ"
      },
      {
        segment: 2,
        title: "CSS Crash Course",
        videoUrl: "https://www.youtube.com/watch?v=1Rs2ND1ryYc"
      }
    ]
  },
  {
    skillName: "JavaScript",
    videos: [
      {
        segment: 1,
        title: "JavaScript Full Course",
        videoUrl: "https://www.youtube.com/watch?v=PkZNo7MFNFg"
      },
      {
        segment: 2,
        title: "JavaScript Advanced Concepts",
        videoUrl: "https://www.youtube.com/watch?v=hdI2bqOjy3c"
      }
    ]
  },
  {
    skillName: "TypeScript",
    videos: [
      {
        segment: 1,
        title: "TypeScript Crash Course",
        videoUrl: "https://www.youtube.com/watch?v=BwuLxPH8IDs"
      },
      {
        segment: 2,
        title: "TypeScript Full Guide",
        videoUrl: "https://www.youtube.com/watch?v=30LWjhZzg50"
      }
    ]
  },
  {
    skillName: "React",
    videos: [
      {
        segment: 1,
        title: "React Full Course",
        videoUrl: "https://www.youtube.com/watch?v=bMknfKXIFA8"
      },
      {
        segment: 2,
        title: "React Project-Based Course",
        videoUrl: "https://www.youtube.com/watch?v=G6D9cBaLViA"
      }
    ]
  },
  {
    skillName: "State Management",
    videos: [
      {
        segment: 1,
        title: "React State Management (Redux + Context)",
        videoUrl: "https://www.youtube.com/watch?v=CVpUuw9XSjY"
      },
      {
        segment: 2,
        title: "Zustand + Redux Toolkit Explained",
        videoUrl: "https://www.youtube.com/watch?v=1z5b4Yv1y5g"
      }
    ]
  },
  {
    skillName: "Node.js",
    videos: [
      {
        segment: 1,
        title: "Node.js Full Course",
        videoUrl: "https://www.youtube.com/watch?v=fBNz5xF-Kx4"
      },
      {
        segment: 2,
        title: "Node.js Project Course",
        videoUrl: "https://www.youtube.com/watch?v=L72fhGm1tfE"
      }
    ]
  },
  {
    skillName: "Express",
    videos: [
      {
        segment: 1,
        title: "Express.js Crash Course",
        videoUrl: "https://www.youtube.com/watch?v=L72fhGm1tfE"
      },
      {
        segment: 2,
        title: "Express REST API Guide",
        videoUrl: "https://www.youtube.com/watch?v=pKd0Rpw7O48"
      }
    ]
  },
  {
    skillName: "REST API",
    videos: [
      {
        segment: 1,
        title: "REST API Node.js Tutorial",
        videoUrl: "https://www.youtube.com/watch?v=pKd0Rpw7O48"
      },
      {
        segment: 2,
        title: "REST API Best Practices",
        videoUrl: "https://www.youtube.com/watch?v=Q-BpqyOT3a8"
      }
    ]
  },
  {
    skillName: "MongoDB",
    videos: [
      {
        segment: 1,
        title: "MongoDB Full Course",
        videoUrl: "https://www.youtube.com/watch?v=-56x56UppqQ"
      },
      {
        segment: 2,
        title: "MongoDB + Node.js Project",
        videoUrl: "https://www.youtube.com/watch?v=Www6cTUymCY"
      }
    ]
  },
  {
    skillName: "SQL",
    videos: [
      {
        segment: 1,
        title: "SQL Full Course",
        videoUrl: "https://www.youtube.com/watch?v=HXV3zeQKqGY"
      },
      {
        segment: 2,
        title: "SQL Practice Problems",
        videoUrl: "https://www.youtube.com/watch?v=7S_tz1z_5bA"
      }
    ]
  },
  {
    skillName: "System Design",
    videos: [
      {
        segment: 1,
        title: "System Design Basics",
        videoUrl: "https://www.youtube.com/watch?v=0s0s9o8Q5JI"
      },
      {
        segment: 2,
        title: "System Design Interview Course",
        videoUrl: "https://www.youtube.com/watch?v=UzLMhqg3_Wc"
      }
    ]
  },
  {
    skillName: "Git",
    videos: [
      {
        segment: 1,
        title: "Git & GitHub Full Course",
        videoUrl: "https://www.youtube.com/watch?v=RGOj5yH7evk"
      },
      {
        segment: 2,
        title: "Git Branching Explained",
        videoUrl: "https://www.youtube.com/watch?v=SWYqp7iY_Tc"
      }
    ]
  },
  {
    skillName: "Docker",
    videos: [
      {
        segment: 1,
        title: "Docker Full Course",
        videoUrl: "https://www.youtube.com/watch?v=3c-iBn73dDE"
      },
      {
        segment: 2,
        title: "Docker Compose & Advanced",
        videoUrl: "https://www.youtube.com/watch?v=pTFZFxd4hOI"
      }
    ]
  },
  {
    skillName: "Linux",
    videos: [
      {
        segment: 1,
        title: "Linux Full Course",
        videoUrl: "https://www.youtube.com/watch?v=ZtqBQ68cfJc"
      },
      {
        segment: 2,
        title: "Linux Command Line Deep Dive",
        videoUrl: "https://www.youtube.com/watch?v=4yqJ9G7f8vQ"
      }
    ]
  },
  {
    skillName: "Kubernetes",
    videos: [
      {
        segment: 1,
        title: "Kubernetes Crash Course",
        videoUrl: "https://www.youtube.com/watch?v=X48VuDVv0do"
      },
      {
        segment: 2,
        title: "Kubernetes Full Guide",
        videoUrl: "https://www.youtube.com/watch?v=7bA0gTroJjw"
      }
    ]
  },
  {
    skillName: "CI/CD",
    videos: [
      {
        segment: 1,
        title: "CI/CD Pipeline Tutorial",
        videoUrl: "https://www.youtube.com/watch?v=1er3ldx48xA"
      }
    ]
  },
  {
    skillName: "AWS",
    videos: [
      {
        segment: 1,
        title: "AWS Full Course",
        videoUrl: "https://www.youtube.com/watch?v=3hLmDS179YE"
      },
      {
        segment: 2,
        title: "AWS DevOps Project",
        videoUrl: "https://www.youtube.com/watch?v=RrKRN9zRBWs"
      }
    ]
  },
  {
    skillName: "Terraform",
    videos: [
      {
        segment: 1,
        title: "Terraform Full Course",
        videoUrl: "https://www.youtube.com/watch?v=SLB_c_ayRMo"
      }
    ]
  },
  {
    skillName: "Bash",
    videos: [
      {
        segment: 1,
        title: "Bash Scripting Full Course",
        videoUrl: "https://www.youtube.com/watch?v=SPwyp2NG-bE"
      }
    ]
  },
  {
    skillName: "Data Structures",
    videos: [
      {
        segment: 1,
        title: "DSA Full Course",
        videoUrl: "https://www.youtube.com/watch?v=RBSGKlAvoiM"
      },
      {
        segment: 2,
        title: "DSA Problem Solving",
        videoUrl: "https://www.youtube.com/watch?v=8hly31xKli0"
      }
    ]
  },
  {
    skillName: "Algorithms",
    videos: [
      {
        segment: 1,
        title: "Algorithms Full Course",
        videoUrl: "https://www.youtube.com/watch?v=8hly31xKli0"
      }
    ]
  },
  {
    skillName: "Python",
    videos: [
      {
        segment: 1,
        title: "Python Full Course",
        videoUrl: "https://www.youtube.com/watch?v=rfscVS0vtbw"
      },
      {
        segment: 2,
        title: "Python Projects Course",
        videoUrl: "https://www.youtube.com/watch?v=8DvywoWv6fI"
      }
    ]
  },
  {
    skillName: "Machine Learning",
    videos: [
      {
        segment: 1,
        title: "Machine Learning Full Course",
        videoUrl: "https://www.youtube.com/watch?v=Gv9_4yMHFhI"
      },
      {
        segment: 2,
        title: "ML Projects Explained",
        videoUrl: "https://www.youtube.com/watch?v=7eh4d6sabA0"
      }
    ]
  },
  {
    skillName: "Pandas",
    videos: [
      {
        segment: 1,
        title: "Pandas Full Course",
        videoUrl: "https://www.youtube.com/watch?v=vmEHCJofslg"
      }
    ]
  },
  {
    skillName: "NumPy",
    videos: [
      {
        segment: 1,
        title: "NumPy Full Course",
        videoUrl: "https://www.youtube.com/watch?v=QUT1VHiLmmI"
      }
    ]
  },
  {
    skillName: "Statistics",
    videos: [
      {
        segment: 1,
        title: "Statistics for Data Science",
        videoUrl: "https://www.youtube.com/watch?v=xxpc-HPKN28"
      }
    ]
  },
  {
    skillName: "Data Visualization",
    videos: [
      {
        segment: 1,
        title: "Data Visualization Python",
        videoUrl: "https://www.youtube.com/watch?v=3Xc3CA655Y4"
      }
    ]
  },
  {
    skillName: "Technical Sourcing",
    videos: [
      {
        segment: 1,
        title: "Technical Sourcing Guide",
        videoUrl: "https://www.youtube.com/watch?v=VqLz7z8m1X0"
      }
    ]
  },
  {
    skillName: "Boolean Search",
    videos: [
      {
        segment: 1,
        title: "Boolean Search Masterclass",
        videoUrl: "https://www.youtube.com/watch?v=1b1Qb5X0z9A"
      }
    ]
  },
  {
    skillName: "Industry Knowledge",
    videos: [
      {
        segment: 1,
        title: "Industry Research Skills",
        videoUrl: "https://www.youtube.com/watch?v=Qy1Xz0Kx9aM"
      }
    ]
  },
  {
    skillName: "Screening",
    videos: [
      {
        segment: 1,
        title: "Candidate Screening Process",
        videoUrl: "https://www.youtube.com/watch?v=Kp9sXy0dQw8"
      }
    ]
  },
  {
    skillName: "Interviewing",
    videos: [
      {
        segment: 1,
        title: "Interviewing Skills Guide",
        videoUrl: "https://www.youtube.com/watch?v=9kz0XxP3m2Q"
      }
    ]
  },
  {
    skillName: "Offer Management",
    videos: [
      {
        segment: 1,
        title: "Offer Management Explained",
        videoUrl: "https://www.youtube.com/watch?v=Zx8pQw1m9K0"
      }
    ]
  },
  {
    skillName: "Negotiation",
    videos: [
      {
        segment: 1,
        title: "Salary Negotiation Skills",
        videoUrl: "https://www.youtube.com/watch?v=H3X0mQ9pK1Z"
      }
    ]
  },
  {
    skillName: "Talent Acquisition",
    videos: [
      {
        segment: 1,
        title: "Talent Acquisition Full Guide",
        videoUrl: "https://www.youtube.com/watch?v=Jk9pQw0mX3A"
      }
    ]
  }
];

export const seedSkillVideos = async () => {
  try {
    console.log("Starting skill videos seeding...");

    // Ensure mongoose is connected
    if (mongoose.connection.readyState === 0) {
      const dbUri = process.env.MONGODB_URI;
      if (!dbUri) {
        throw new Error("MONGODB_URI environment variable is not defined.");
      }
      await mongoose.connect(dbUri);
    }

    for (const seed of videoSeeds) {
      if (!seed.skillName) continue;
      await SkillVideo.findOneAndUpdate(
        { skillName: seed.skillName },
        seed,
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      );
    }

    console.log("Skill videos seeding completed successfully.");
  } catch (error) {
    console.error("Error during skill videos seeding:", error.message);
    throw error;
  }
};
