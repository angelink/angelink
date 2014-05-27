'use strict';

exports.parseTags = function(angel, output){
  if (angel.tags.length) {
    for (var i=0; i<angel.tags.length; i++){
      var tag = angel.tags[i];
      if (tag.tag_type === 'LocationTag') {
        output.location = tag.name;
      } else if (tag.tag_type === 'RoleTag') {
        output.roles.push(tag.name);
      } else if (tag.tag_type === 'SkillTag') {
        output.skills.push(tag.name);
      }
    }
  }
};

exports.parseObj= function(angel){
  var output = {};
  output.id = angel.id;
  output.title = angel.title;
  output.created = angel.created_at;
  output.company = angel.startup.name;
  output.company_id = angel.startup.id;
  output.salary = {
    currency: angel.currency_code,
    salaryMax: Number(angel.salary_max),
    salaryMin: Number(angel.salary_min),
    equityMax: Number(angel.equity_max),
    equityMin: Number(angel.equity_min)
  };
  output.roles = [];
  output.skills = [];
  exports.parseTags(angel, output);
  return output;
};
