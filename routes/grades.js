const express = require('express');
const router = express.Router();
const fs = require('fs');

global.fileName = './grades.json';

// 01 - Cria uma grade e retorna o objeto
router.post('/', (req, res) => {
  let grade = req.body;

  fs.readFile(fileName, 'utf8', (err, data) => {
    try {
      if (err) throw err;

      let gradeParsed = JSON.parse(data);
      grade.timestamp = new Date();
      grade = { id: gradeParsed.nextId++, ...grade };
      gradeParsed.grades.push(grade);

      fs.writeFile(fileName, JSON.stringify(gradeParsed), (err) => {
        if (err) {
          res.status(400).send({ writingFile: err.message });
        } else {
          res.send(grade);
        }
      });
    } catch (err) {
      res.status(400).send({ error: err.message });
    }
  });
});

// 02 - Atualiza a grade e retorna o objeto
router.put('/', (req, res) => {
  let newData = req.body;
  fs.readFile(fileName, 'utf8', (err, data) => {
    try {
      if (err) throw err;

      let gradeParsed = JSON.parse(data);
      let oldData = gradeParsed.grades.findIndex(
        (grades) => grades.id === newData.id
      );

      gradeParsed.grades[oldData].student = newData.student;
      gradeParsed.grades[oldData].subject = newData.subject;
      gradeParsed.grades[oldData].type = newData.type;
      gradeParsed.grades[oldData].value = newData.value;

      fs.writeFile(global.fileName, JSON.stringify(gradeParsed), (err) => {
        if (err) {
          res.status(400).send({ errorWriting: err.message });
        } else {
          res.send(newData);
        }
      });
    } catch (err) {
      res.status(400).send({ error: err.message });
    }
  });
});

// 03 - Deleta a grade
router.delete('/:id', (req, res) => {
  fs.readFile(fileName, 'utf8', (err, data) => {
    try {
      if (err) throw err;

      let gradeParsed = JSON.parse(data);
      let grade = gradeParsed.grades.filter(
        (grades) => grades.id !== parseInt(req.params.id, 10)
      );

      gradeParsed.grades = grade;

      fs.writeFile(fileName, JSON.stringify(gradeParsed), (err) => {
        if (err) {
          res.status(400).send({ error: err.message });
        } else {
          res.end();
        }
      });
    } catch (err) {
      res.status(400).send({ error: err.message });
    }
  });
});

// 04 - Consulta uma grade em específico pelo ID
router.get('/:id', (req, res) => {
  fs.readFile(fileName, 'utf8', (err, data) => {
    try {
      if (err) throw err;

      let gradeParsed = JSON.parse(data);
      let grade = gradeParsed.grades.find(
        (grades) => grades.id === parseInt(req.params.id, 10)
      );
      if (grade) {
        res.send(grade);
      } else {
        res.end();
      }
    } catch (err) {
      res.status(400).send({ error: err.message });
    }
  });
});

// 05 - Consulta a nota total de um aluno em uma disciplina
// voltar pra get depois
router.post('/sum', (req, res) => {
  fs.readFile(fileName, 'utf8', (err, data) => {
    try {
      if (err) throw err;

      const { student, subject } = req.body;

      let gradeParsed = JSON.parse(data);
      let gradeStudent = gradeParsed.grades
        .filter((grade) => {
          return grade.student === student && grade.subject === subject;
        })
        .reduce((sum, grades) => {
          return sum + grades.value;
        }, 0);
      res.send(
        `Nota total do aluno(a) ${req.body.student} na disciplina ${req.body.subject} foi ${gradeStudent}.`
      );
    } catch (err) {
      res.status(400).send({ error: err.message });
    }
  });
});

// 06 - Consulta a média das grades de determinado subject e type
// voltar pra get depois
router.post('/avg', (req, res) => {
  fs.readFile(fileName, 'utf8', (err, data) => {
    try {
      if (err) throw err;

      const { subject, type } = req.body;

      let gradeParsed = JSON.parse(data);
      let gradeAvg = gradeParsed.grades.filter((grade) => {
        return grade.subject === subject && grade.type === type;
      });
      let final = gradeAvg.reduce((sum, grades) => {
        return sum + grades.value;
      }, 0);

      let resultAvg = final / gradeAvg.length;
      res.send(`A média das grades de ${req.body.subject} é ${resultAvg}.`);
    } catch (err) {
      res.status(400).send({ error: err.message });
    }
  });
});

// 07 - Retorna as três melhores grades de acordo com determinado subject e type.
router.post('/bestGrades', (req, res) => {
  fs.readFile(fileName, 'utf8', (err, data) => {
    try {
      if (err) throw err;

      const { subject, type } = req.body;

      let gradeParsed = JSON.parse(data);

      let topGrades = gradeParsed.grades.filter((grade) => {
        return grade.subject === subject && grade.type === type;
      });

      //
      topGrades.sort((a, b) => {
        if (a.value > b.value) return -1;
        if (a.value < b.value) return 1;
        return 0;
      });

      let top3Grades = topGrades.slice(0, 3);

      res.send(top3Grades);
    } catch (err) {
      res.status(400).send({ error: err.message });
    }
  });
});

module.exports = router;
